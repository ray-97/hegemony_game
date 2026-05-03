import asyncio
import os
import json
from pathlib import Path
from anchorpy import Program, Provider, Wallet
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from solders.keypair import Keypair

# Path to the IDL
IDL_PATH = Path("../target/idl/hegemony.json")
PROGRAM_ID = Pubkey.from_string("79yvXQvVyqMYy4ofqKQD1CZXQSyH5eJ7dHT6ZZuXg7ND")

class GeopoliticalIntelligenceAgency:
    def __init__(self, program: Program):
        self.program = program

    async def fetch_world_state(self):
        """Fetches the entire on-chain state for analysis."""
        regions = await self.program.account["RegionAccount"].all()
        markets = await self.program.account["MarketAccount"].all()
        global_state_pda, _ = Pubkey.find_program_address([b"global_state"], PROGRAM_ID)
        global_state = await self.program.account["GlobalState"].fetch(global_state_pda)
        
        return {
            "global": global_state,
            "regions": [r.account for r in regions],
            "markets": [m.account for r in markets] # Typing fix: markets accounts
        }

    def construct_narrative_prompt(self, state):
        """Formats the raw on-chain data into a prompt for an LLM."""
        prompt = "--- GEOPOLITICAL INTELLIGENCE BRIEF DATA ---\n"
        prompt += f"Epoch: {state['global'].epoch}, Turn: {state['global'].turn}\n"
        prompt += f"Game Status: {state['global'].status}\n\n"
        
        prompt += "REGIONAL DATA:\n"
        for reg in state['regions']:
            prompt += (f"Region {reg.id}: Dominance {reg.dominance}%, "
                       f"Energy Lvl {reg.energy_level}, Tech Lvl {reg.tech_level}, "
                       f"Logistics Lvl {reg.logistics_level}, Status: {reg.status}\n")
        
        # Note: In a real bot, we'd filter markets by region or type
        # For this prototype, we just provide regional stats.
        
        prompt += "\nTASK:\n"
        prompt += "As the Global Intelligence Agency, analyze the power shifts. "
        prompt += "Identify the most vulnerable region and the rising Hegemon. "
        prompt += "Generate a concise 3-paragraph intelligence brief for the players."
        
        return prompt

    async def generate_brief(self):
        """Calls the (simulated) LLM to generate the report."""
        print("Fetching on-chain world state...")
        try:
            state = await self.fetch_world_state()
            prompt = self.construct_narrative_prompt(state)
            
            print("\n[PROMPT FOR LLM]:")
            print(prompt)
            print("\n" + "="*50 + "\n")

            # MOCK LLM RESPONSE (In production, use OpenAI/Anthropic API)
            print("AGENT RESPONSE (Simulated AI):")
            mock_report = (
                "**STRATEGIC ALERT**: The world order is shifting. Region 1 currently leads with 20% dominance, "
                "bolstered by balanced investment in basic infrastructure. However, the lack of Tier 2 Technology "
                "makes them susceptible to mid-game sabotage.\n\n"
                "**MARKET ANALYSIS**: High volatility is expected in the Energy sub-sectors. Intelligence suggests "
                "that state actors are quietly accumulating 'NO' shares in target infrastructure projects, "
                "signaling imminent kinetic shocks.\n\n"
                "**RECOMMENDATION**: Global Citizens are advised to hedge their regional bonds with micro-market "
                "insurance positions. Watch the Logistics level—whoever seizes maritime routes next Turn will likely "
                "dictate the coming Turn's trading tax regime."
            )
            print(mock_report)
            return mock_report

        except Exception as e:
            print(f"Intelligence Agency Error: {e}")

async def main():
    client = AsyncClient("http://localhost:8899")
    with open(os.path.expanduser("~/.config/solana/id.json"), "r") as f:
        keypair_data = json.load(f)
        bot_keypair = Keypair.from_bytes(bytes(keypair_data))
    
    wallet = Wallet(bot_keypair)
    provider = Provider(client, wallet)

    with open(IDL_PATH, "r") as f:
        idl = json.load(f)
    program = Program(idl, PROGRAM_ID, provider)

    agency = GeopoliticalIntelligenceAgency(program)
    await agency.generate_brief()

if __name__ == "__main__":
    asyncio.run(main())
