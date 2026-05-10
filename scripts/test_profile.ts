import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hegemony } from "../target/types/hegemony";
import { PublicKey } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Hegemony as Program<Hegemony>;

  const [profilePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("player_profile"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  console.log("Setting name to Don Tzu...");
  try {
    const tx = await program.methods
      .initializePlayerProfile("Don Tzu")
      .accounts({
        profile: profilePda,
        authority: provider.wallet.publicKey,
      } as any)
      .rpc();
    console.log("Success! TX:", tx);
  } catch (err) {
    console.error("Failed:", err);
  }
}

main();
