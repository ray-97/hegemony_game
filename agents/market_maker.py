import asyncio
import os
from pathlib import Path
from anchorpy import Program, Provider, Wallet, Context
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from solders.keypair import Keypair

# Path to the IDL
IDL_PATH = Path("../target/idl/hegemony.json")
PROGRAM_ID = Pubkey.from_string("DqPFvuxkEdZJ4ZcDV5ufiPG9rG9k7WSy8zsidrewo7JX")

async def main():
    # 1. Setup Connection & Provider
    client = AsyncClient("http://localhost:8899")
    
    # Load bot keypair (defaulting to the same one for simplicity in MVP)
    with open(os.path.expanduser("~/.config/solana/id.json"), "r") as f:
        import json
        keypair_data = json.load(f)
        bot_keypair = Keypair.from_bytes(bytes(keypair_data))
    
    wallet = Wallet(bot_keypair)
    provider = Provider(client, wallet)

    # 2. Load Program
    with open(IDL_PATH, "r") as f:
        idl = f.read()
    program = Program(json.loads(idl), PROGRAM_ID, provider)

    print(f"Market Maker Bot Started: {wallet.public_key}")

    while True:
        try:
            # 3. Scan for Markets
            markets = await program.account["MarketAccount"].all()
            print(f"Scanning {len(markets)} markets...")

            for market in markets:
                state = market.account
                # If market is illiquid (example threshold: 500 $CAP)
                # and unresolved
                if state.pool_no < 500 and str(state.resolution_state) == "Unresolved":
                    print(f"Market {state.market_id} is illiquid (NO pool: {state.pool_no}). Injecting NO liquidity...")
                    
                    # In a real bot, we'd calculate the right amount and call trade_shares(False, amount)
                    # For now, just a log to show the bot is "watching"
                    
            await asyncio.sleep(10) # Wait 10 seconds between scans
        except Exception as e:
            print(f"Error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
