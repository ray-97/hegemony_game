import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hegemony } from "../target/types/hegemony";
import { createMint } from "@solana/spl-token";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Hegemony as Program<Hegemony>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  console.log("Starting Refined Board Initialization...");

  // 1. Derive Global State PDA
  const [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  // 2. Create Capital Mint (PDA as authority)
  console.log("Creating Capital Mint...");
  const capitalMint = await createMint(
    provider.connection,
    authority,
    globalStatePda,
    null,
    9
  );
  console.log("Capital Mint:", capitalMint.toBase58());

  // 3. Initialize Global State
  console.log("Initializing Global State...");
  const treasury = anchor.web3.Keypair.generate();
  const auctionDuration = new anchor.BN(86400 * 2); // 48h Auction
  const epochDuration = new anchor.BN(86400 * 30); // 30d Epoch
  
  await program.methods
    .initializeGlobalState(auctionDuration, epochDuration)
    .accounts({
      globalState: globalStatePda,
      authority: authority.publicKey,
      treasury: treasury.publicKey,
      capitalMint: capitalMint,
      systemProgram: anchor.web3.SystemProgram.programId,
    } as any)
    .rpc();

  // 4. Initialize 7 Regions
  const regions = [
    { id: 1, name: "North American Bloc", yield: 1000 },
    { id: 2, name: "Pan-Asian Alliance", yield: 1200 },
    { id: 3, name: "European Union", yield: 900 },
    { id: 4, name: "African Union", yield: 700 },
    { id: 5, name: "South American Coalition", yield: 800 },
    { id: 6, name: "Middle Eastern Sector", yield: 1500 },
    { id: 7, name: "Oceanic Federation", yield: 600 },
  ];

  for (const reg of regions) {
    console.log(`Initializing Region ${reg.id}: ${reg.name}...`);
    
    const [regionPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("region"), Buffer.from([reg.id])],
      program.programId
    );

    const [bondMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("bond_mint"), Buffer.from([reg.id])],
      program.programId
    );

    const [bondVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from([reg.id])],
      program.programId
    );

    await program.methods
      .initializeRegion(reg.id, new anchor.BN(reg.yield))
      .accounts({
        region: regionPda,
        bondMint: bondMintPda,
        bondVault: bondVaultPda,
        globalState: globalStatePda,
        capitalMint: capitalMint,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();

    // Also initialize Leaderboard for each region
    console.log(`Initializing Leaderboard for Region ${reg.id}...`);
    const [leaderboardPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("leaderboard"), Buffer.from([reg.id])],
      program.programId
    );

    await program.methods
      .initializeLeaderboard(reg.id)
      .accounts({
        leaderboard: leaderboardPda,
        globalState: globalStatePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();
  }

  console.log("Full Game Board Initialized Successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
