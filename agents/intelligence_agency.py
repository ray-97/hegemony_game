import asyncio
import os
import json
import time
from pathlib import Path
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
import base64
import struct

# Constants
PROGRAM_ID = Pubkey.from_string("DqPFvuxkEdZJ4ZcDV5ufiPG9rG9k7WSy8zsidrewo7JX")
OUTPUT_PATH = Path("../app/public/data/intelligence.json")

class GeopoliticalIntelligenceAgency:
    def __init__(self, client: AsyncClient):
        self.client = client

    async def fetch_regions(self):
        """Fetches all RegionAccount accounts."""
        discriminator = bytes([212, 36, 165, 65, 54, 204, 128, 178])
        response = await self.client.get_program_accounts(PROGRAM_ID, encoding="base64")
        
        regions = []
        for item in response.value:
            data = item.account.data
            if data[:8] == discriminator:
                region_id = data[8]
                dominance = data[9]
                regions.append({"id": region_id, "dominance": dominance})
            
        return regions

    async def fetch_global_state(self):
        """Fetches GlobalState."""
        pda, _ = Pubkey.find_program_address([b"global_state"], PROGRAM_ID)
        response = await self.client.get_account_info(pda, encoding="base64")
        if response.value:
            data = response.value.data
            # GlobalState Layout:
            # 8 (disc) + 8 (epoch) + 4 (turn) + ...
            epoch = struct.unpack("<Q", data[8:16])[0]
            turn = struct.unpack("<I", data[16:20])[0]
            return {"epoch": epoch, "turn": turn}
        return {"epoch": 0, "turn": 0}

    async def run(self):
        """Main loop to update intelligence reports."""
        os.makedirs(OUTPUT_PATH.parent, exist_ok=True)
        
        while True:
            print(f"[{time.strftime('%H:%M:%S')}] Updating Intelligence Report...")
            try:
                regions = await self.fetch_regions()
                global_state = await self.fetch_global_state()
                
                if not regions:
                    print("No regions found yet.")
                    await asyncio.sleep(5)
                    continue

                sorted_regions = sorted(regions, key=lambda x: x['dominance'], reverse=True)
                top_region = sorted_regions[0]
                bottom_region = sorted_regions[-1]
                
                reports = [
                    {
                        "id": int(time.time()) + 1,
                        "type": "Strategic",
                        "text": f"Region {top_region['id']} has reached {top_region['dominance']}% dominance. Global monitoring initiated."
                    },
                    {
                        "id": int(time.time()) + 2,
                        "type": "Market",
                        "text": f"Supply chain skews detected in Region {bottom_region['id']}. Opportunity for arbitrage identified."
                    },
                    {
                        "id": int(time.time()) + 3,
                        "type": "Tactical",
                        "text": f"Logistics parity shifting. Turn {global_state['turn']} will be critical for trade route control."
                    }
                ]
                
                with open(OUTPUT_PATH, "w") as f:
                    json.dump(reports, f)
                
                print(f"Report saved to {OUTPUT_PATH}")

            except Exception as e:
                print(f"Intelligence Agency Error: {e}")
            
            await asyncio.sleep(10)

async def main():
    client = AsyncClient("http://localhost:8899")
    agency = GeopoliticalIntelligenceAgency(client)
    await agency.run()

if __name__ == "__main__":
    asyncio.run(main())
