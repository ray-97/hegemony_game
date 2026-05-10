import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hegemony } from "../target/types/hegemony";
import { createMint } from "@solana/spl-token";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Hegemony as Program<Hegemony>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  console.log("Starting Asymmetric Board Initialization (5 Regions)...");

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
  const auctionDuration = new anchor.BN(0); // 0s Auction for instant testing
  const epochDuration = new anchor.BN(86400); // 1d Epoch
  
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

  // 4. Initialize 5 Strategic Regions per Spec
  const regions = [
    { 
        id: 1, 
        name: "Pan-Asian Alliance", 
        yield: 800, 
        energy: 0, 
        tech: 3, 
        logistics: 0 
    },
    { 
        id: 2, 
        name: "North American Federation", 
        yield: 1200, 
        energy: 1, 
        tech: 1, 
        logistics: 1 
    },
    { 
        id: 3, 
        name: "Eurozone Bloc", 
        yield: 1000, 
        energy: 0, 
        tech: 0, 
        logistics: 2 
    },
    { 
        id: 4, 
        name: "Gulf-MENA Kingdom", 
        yield: 1500, 
        energy: 3, 
        tech: 0, 
        logistics: 0 
    },
    { 
        id: 5, 
        name: "Global South Coalition", 
        yield: 700, 
        energy: 0, 
        tech: 0, 
        logistics: 0 
    },
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
      .initializeRegion(
        reg.id, 
        new anchor.BN(reg.yield),
        reg.energy,
        reg.tech,
        reg.logistics
      )
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

  console.log("Asymmetric World State Initialized Successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
