import asyncio
import os
import json
import time
from pathlib import Path
from anchorpy import Program, Provider, Wallet, Context
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from solders.keypair import Keypair
from solana.rpc.commitment import Confirmed
from spl.token.instructions import get_associated_token_address
from solders.system_program import ID as SYS_PROGRAM_ID
from spl.token.constants import TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID

# Path to the IDL
IDL_PATH = Path("../target/idl/hegemony.json")
PROGRAM_ID = Pubkey.from_string("DqPFvuxkEdZJ4ZcDV5ufiPG9rG9k7WSy8zsidrewo7JX")

async def main():
    # 1. Setup Connection & Provider
    client = AsyncClient("http://localhost:8899", commitment=Confirmed)
    
    with open(os.path.expanduser("~/.config/solana/id.json"), "r") as f:
        keypair_data = json.load(f)
        bot_keypair = Keypair.from_bytes(bytes(keypair_data))
    
    wallet = Wallet(bot_keypair)
    provider = Provider(client, wallet)

    # 2. Load Program
    with open(IDL_PATH, "r") as f:
        idl_json = f.read()
    program = Program(json.loads(idl_json), PROGRAM_ID, provider)

    print(f"--- SOVEREIGN WEALTH FUND BOT ACTIVE ---")
    print(f"Bot Identity: {wallet.public_key}")

    while True:
        try:
            # 3. Scan for Markets
            markets = await program.account["MarketAccount"].all()
            print(f"[{time.strftime('%H:%M:%S')}] Monitoring {len(markets)} tactical thesis markets...")

            for market in markets:
                pda = market.public_key
                state = market.account
                
                # Check if market is unbalanced (Maker logic)
                # If pool_yes is too high relative to pool_no, buy NO to balance
                # Threshold: 10% skew
                total = state.pool_yes + state.pool_no
                if total == 0: continue
                
                skew = abs(state.pool_yes - state.pool_no) / total
                
                if skew > 0.05 and str(state.resolution_state) == "Unresolved":
                    is_buying_yes = state.pool_no > state.pool_yes
                    side = "YES" if is_buying_yes else "NO"
                    print(f"  > SKEW DETECTED on Thesis {state.market_id}: {skew*100:.1f}%. Injecting {side} liquidity...")
                    
                    # For demo: Inject small amounts to show activity
                    amount = 50 * 10**9 # 50 $CAP
                    
                    # PDAs and ATAs
                    global_state_pda, _ = Pubkey.find_program_address([b"global_state"], PROGRAM_ID)
                    g_state = await program.account["GlobalState"].fetch(global_state_pda)
                    
                    user_capital_ata = get_associated_token_address(wallet.public_key, g_state.capital_mint)
                    user_yes_ata = get_associated_token_address(wallet.public_key, state.yes_mint)
                    user_no_ata = get_associated_token_address(wallet.public_key, state.no_mint)
                    
                    try:
                        await program.rpc["trade_shares"](
                            is_buying_yes,
                            amount,
                            ctx=Context(
                                accounts={
                                    "market": pda,
                                    "trader": wallet.public_key,
                                    "trader_capital_account": user_capital_ata,
                                    "vault_token_account": state.capital_vault,
                                    "yes_mint": state.yes_mint,
                                    "no_mint": state.no_mint,
                                    "trader_yes_account": user_yes_ata,
                                    "trader_no_account": user_no_ata,
                                    "token_program": TOKEN_PROGRAM_ID,
                                    "associated_token_program": ASSOCIATED_TOKEN_PROGRAM_ID,
                                    "system_program": SYS_PROGRAM_ID,
                                    "rent": Pubkey.from_string("SysvarRent11111111111111111111111111111111"),
                                }
                            )
                        )
                        print(f"  [SUCCESS] Liquidity injected into {side} pool.")
                    except Exception as e:
                        if "AccountNotInitialized" in str(e):
                           print(f"  [WAIT] Bot needs $CAP. Fund it in UI first.")
                        else:
                           print(f"  [ERROR] Trade failed: {e}")

            await asyncio.sleep(8) 
        except Exception as e:
            print(f"Global Error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
