import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hegemony } from "../target/types/hegemony";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Hegemony as Program<Hegemony>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  console.log("--- Hegemony Settlement & Infra Test ---");

  const [globalStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  let globalState = await program.account.globalState.fetch(globalStatePda);
  console.log("Current Game Status:", Object.keys(globalState.status)[0]);

  // 1. Transition to Active if in PreEpoch
  if (Object.keys(globalState.status)[0] === "preEpoch") {
    console.log("Transitioning to Active phase...");
    // We need a leaderboard to resolve auction. Let's find Region 1 leaderboard.
    const [leaderboardPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("leaderboard"), Buffer.from([1])],
      program.programId
    );
    const [regionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("region"), Buffer.from([1])],
      program.programId
    );

    await program.methods
      .resolveAuction()
      .accounts({
        globalState: globalStatePda,
        leaderboard: leaderboardPda,
        region: regionPda,
        authority: authority.publicKey,
      } as any)
      .rpc();
    
    globalState = await program.account.globalState.fetch(globalStatePda);
    console.log("Status updated to:", Object.keys(globalState.status)[0]);
  }

  // 2. Create Infrastructure Market (ID: 0 -> Energy Upgrade)
  const regionId = 1;
  const eventIndex = 0; 
  const marketId = new anchor.BN(Date.now() / 1000).mul(new anchor.BN(100)).add(new anchor.BN(eventIndex));
  const liquidity = new anchor.BN(500).mul(new anchor.BN(10).pow(new anchor.BN(9)));

  const [regionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("region"), Buffer.from([regionId])],
    program.programId
  );
  const regionBefore = await program.account.regionAccount.fetch(regionPda);
  console.log(`Region 1 Energy Level Before: ${regionBefore.energyLevel}`);

  const [marketPda] = PublicKey.findProgramAddressSync([Buffer.from("market"), marketId.toArrayLike(Buffer, "le", 8)], program.programId);
  const [yesMintPda] = PublicKey.findProgramAddressSync([Buffer.from("yes_mint"), marketId.toArrayLike(Buffer, "le", 8)], program.programId);
  const [noMintPda] = PublicKey.findProgramAddressSync([Buffer.from("no_mint"), marketId.toArrayLike(Buffer, "le", 8)], program.programId);
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("market_vault"), marketId.toArrayLike(Buffer, "le", 8)], program.programId);

  const userCapitalAta = getAssociatedTokenAddressSync(globalState.capitalMint, authority.publicKey);

  console.log(`Creating Market ${marketId.toString()} for Energy Upgrade...`);
  await program.methods
    .initializeMarket(marketId, regionId, { macro: {} }, liquidity)
    .accounts({
      globalState: globalStatePda,
      region: regionPda,
      market: marketPda,
      yesMint: yesMintPda,
      noMint: noMintPda,
      capitalVault: vaultPda,
      creator: authority.publicKey,
      creatorCapitalAccount: userCapitalAta,
      capitalMint: globalState.capitalMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    } as any)
    .rpc();

  // 3. Trade YES to create imbalance
  console.log("Trading 100 $CAP for YES shares...");
  const tradeAmount = new anchor.BN(100).mul(new anchor.BN(10).pow(new anchor.BN(9)));
  const userYesAta = getAssociatedTokenAddressSync(yesMintPda, authority.publicKey);
  const userNoAta = getAssociatedTokenAddressSync(noMintPda, authority.publicKey);

  await program.methods
    .tradeShares(true, tradeAmount)
    .accounts({
      market: marketPda,
      trader: authority.publicKey,
      traderCapitalAccount: userCapitalAta,
      vaultTokenAccount: vaultPda,
      yesMint: yesMintPda,
      noMint: noMintPda,
      traderYesAccount: userYesAta,
      traderNoAccount: userNoAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    } as any)
    .rpc();

  // 4. Advance Turn
  console.log("Advancing Turn...");
  await new Promise(resolve => setTimeout(resolve, 6000)); // Wait for 5s TURN_DURATION
  await program.methods
    .advanceTurn()
    .accounts({
      globalState: globalStatePda,
      authority: authority.publicKey,
    } as any)
    .rpc();

  // 5. Resolve Market to YES
  console.log("Resolving Market to YES...");
  const bondVaultPda = regionBefore.bondVault;
  
  await program.methods
    .resolveMarket(true)
    .accounts({
      market: marketPda,
      region: regionPda,
      marketVault: vaultPda,
      bondVault: bondVaultPda,
      yesMint: yesMintPda,
      noMint: noMintPda,
      globalState: globalStatePda,
      authority: authority.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc();

  // 6. Verify Results
  const regionAfter = await program.account.regionAccount.fetch(regionPda);
  console.log(`Region 1 Energy Level After: ${regionAfter.energyLevel}`);
  
  if (regionAfter.energyLevel > regionBefore.energyLevel) {
    console.log("SUCCESS: Energy level increased!");
  } else {
    console.error("FAILURE: Energy level did not increase.");
  }

  const bondVaultBalance = await provider.connection.getTokenAccountBalance(bondVaultPda);
  console.log(`Bond Vault Balance: ${bondVaultBalance.value.uiAmount} $CAP`);
  if (Number(bondVaultBalance.value.amount) > 0) {
    console.log("SUCCESS: Surplus swept to bond vault!");
  }

  console.log("--- Test Complete ---");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
