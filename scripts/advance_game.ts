import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hegemony } from "../target/types/hegemony";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Hegemony as Program<Hegemony>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  console.log("--- Hegemony Turn Advancement Tool ---");

  const [globalStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  const globalState = await program.account.globalState.fetch(globalStatePda);
  console.log(`Current Turn: ${globalState.turn}`);

  // 1. Advance Turn
  console.log("Advancing Turn...");
  try {
    await program.methods
      .advanceTurn()
      .accounts({
        globalState: globalStatePda,
        authority: authority.publicKey,
      } as any)
      .rpc();
    
    const updatedState = await program.account.globalState.fetch(globalStatePda);
    console.log(`SUCCESS: Turn is now ${updatedState.turn}`);
  } catch (err: any) {
    if (err.message.includes("TurnNotReady")) {
      console.log("WAIT: Turn not ready yet (5s cooldown).");
    } else {
      console.error("Advance Turn Failed:", err);
    }
  }

  // 2. Process Income for all 5 regions
  console.log("Processing Regional Income...");
  for (let id = 1; id <= 5; id++) {
    const [regionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("region"), Buffer.from([id])],
      program.programId
    );
    
    try {
      const region = await program.account.regionAccount.fetch(regionPda);

      await program.methods
        .processRegionIncome()
        .accounts({
          globalState: globalStatePda,
          region: regionPda,
          capitalMint: globalState.capitalMint,
          bondVault: region.bondVault,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .rpc();
      
      console.log(`Region ${id}: Income Processed.`);
    } catch (err: any) {
       console.log(`Region ${id}: Skip (Already processed or error).`);
    }
  }

  console.log("--- Turn Advancement Complete ---");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
