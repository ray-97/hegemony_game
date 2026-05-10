import asyncio
import os
import time
from pathlib import Path
from anchorpy import Program, Provider, Wallet
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from solders.keypair import Keypair

IDL_PATH = Path("../target/idl/hegemony.json")
PROGRAM_ID = Pubkey.from_string("DqPFvuxkEdZJ4ZcDV5ufiPG9rG9k7WSy8zsidrewo7JX")

async def main():
    client = AsyncClient("http://localhost:8899")
    
    with open(os.path.expanduser("~/.config/solana/id.json"), "r") as f:
        import json
        keypair_data = json.load(f)
        bot_keypair = Keypair.from_bytes(bytes(keypair_data))
    
    wallet = Wallet(bot_keypair)
    provider = Provider(client, wallet)

    with open(IDL_PATH, "r") as f:
        idl = json.load(f)
    program = Program(idl, PROGRAM_ID, provider)

    print(f"Turn Keeper Bot Started: {wallet.public_key}")

    while True:
        try:
            # 1. Fetch Global State
            # Finding PDA
            global_state_pda, _ = Pubkey.find_program_address(
                [b"global_state"],
                PROGRAM_ID
            )
            
            state = await program.account["GlobalState"].fetch(global_state_pda)
            
            # 2. Check if turn transition is needed
            # For testing, TURN_DURATION is 5 seconds. In production, 86400.
            # We can't easily see the constant from the IDL usually, so we fetch it or hardcode.
            # For now, let's just try to call advance_turn every 10 seconds.
            
            print(f"Current Turn: {state.turn}. Checking if ready to advance...")
            
            # Attempt to advance turn
            try:
                # We need to pass the required accounts
                # pub struct AdvanceTurn<'info> { global_state, authority }
                tx = await program.rpc["advance_turn"](
                    ctx=anchorpy.Context(
                        accounts={
                            "global_state": global_state_pda,
                            "authority": wallet.public_key,
                        }
                    )
                )
                print(f"Turn Advanced! TX: {tx}")
            except Exception as e:
                # This will likely fail with "TurnNotReady" if called too early
                if "TurnNotReady" in str(e):
                    print("Turn not ready yet.")
                else:
                    print(f"Advance Turn Error: {e}")

            await asyncio.sleep(15)
        except Exception as e:
            print(f"Main Loop Error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
