import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hegemony } from "../target/types/hegemony";
import { PublicKey } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Hegemony as Program<Hegemony>;

  // USER ADDRESS
  const userAddress = new PublicKey("EeHZdUYngn8tooohV3GiZ5gaeKTTX1hjs37GsuuYgafP");

  console.log("Starting Simplified God-Mode Funding...");

  // 1. Airdrop 100 SOL to user
  console.log("Airdropping 100 SOL to user...");
  const signature = await provider.connection.requestAirdrop(userAddress, 100 * 1e9);
  await provider.connection.confirmTransaction(signature);

  console.log("GOD-MODE COMPLETE.");
  console.log(`User ${userAddress.toBase58()} now has 100 SOL.`);
  console.log("Go to the UI and click 'Fund Terminal' to get $CAP!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
