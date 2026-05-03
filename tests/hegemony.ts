import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hegemony } from "../target/types/hegemony";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } from "@solana/spl-token";
import { expect } from "chai";

describe("hegemony", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Hegemony as Program<Hegemony>;
  const authority = provider.wallet as anchor.Wallet;

  let globalStatePda: anchor.web3.PublicKey;
  let regionPda: anchor.web3.PublicKey;
  let leaderboardPda: anchor.web3.PublicKey;
  let escrowPda: anchor.web3.PublicKey;
  let capitalMint: anchor.web3.PublicKey;
  let treasury = anchor.web3.Keypair.generate();

  const regionId = 1;

  before(async () => {
    [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      program.programId
    );

    [regionPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("region"), Buffer.from([regionId])],
      program.programId
    );

    [leaderboardPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("leaderboard"), Buffer.from([regionId])],
      program.programId
    );

    [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), authority.publicKey.toBuffer(), Buffer.from([regionId])],
      program.programId
    );

    capitalMint = await createMint(
      provider.connection,
      authority.payer,
      authority.publicKey, // Developer as initial authority
      null,
      9
    );

    // Pre-mint tokens to the authority before we lose the authority
    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      capitalMint,
      authority.publicKey
    );

    await mintTo(
      provider.connection,
      authority.payer,
      capitalMint,
      ata.address,
      authority.publicKey,
      1000000 // 1M tokens
    );
  });

  it("Initializes Global State", async () => {
    const auctionDuration = new anchor.BN(5); // 5s auction
    const epochDuration = new anchor.BN(86400 * 30); // 30 days
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

    const state = await program.account.globalState.fetch(globalStatePda);
    expect(state.epoch.toNumber()).to.equal(1);
    expect(Object.keys(state.status)[0]).to.equal("preEpoch");

    // NOW set the mint authority to the PDA so the program can mint yield later
    await setAuthority(
      provider.connection,
      authority.payer,
      capitalMint,
      authority.publicKey,
      AuthorityType.MintTokens,
      globalStatePda
    );
  });

  it("Initializes Region and Leaderboard", async () => {
    await program.methods
      .initializeRegion(regionId, new anchor.BN(1000))
      .accounts({
        region: regionPda,
        globalState: globalStatePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    await program.methods
      .initializeLeaderboard(regionId)
      .accounts({
        leaderboard: leaderboardPda,
        globalState: globalStatePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();
  });

  it("Submits a Manifesto Bid", async () => {
    const amount = new anchor.BN(5000);
    const manifestoUri = "https://arweave.net/manifesto123";

    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      capitalMint,
      authority.publicKey
    );

    const vaultAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      capitalMint,
      globalStatePda,
      true
    );

    await program.methods
      .submitManifestoBid(regionId, amount, manifestoUri)
      .accounts({
        globalState: globalStatePda,
        leaderboard: leaderboardPda,
        escrow: escrowPda,
        bidder: authority.publicKey,
        bidderTokenAccount: ata.address,
        vaultTokenAccount: vaultAta.address,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const lb = await program.account.regionLeaderboard.fetch(leaderboardPda);
    expect(lb.currentLeader.toString()).to.equal(authority.publicKey.toString());
    expect(lb.totalBidWeight.toNumber()).to.equal(5000);
  });

  it("Fails to advance turn in PreEpoch status", async () => {
    try {
      await program.methods
        .advanceTurn()
        .accounts({
          globalState: globalStatePda,
          authority: authority.publicKey,
        } as any)
        .rpc();
      expect.fail("Should have failed");
    } catch (err) {
      expect(err.toString()).to.contain("InvalidStatus");
    }
  });

  it("Resolves Auction after delay", async () => {
    console.log("Waiting 5s for auction to end...");
    await new Promise(resolve => setTimeout(resolve, 5500));

    await program.methods
      .resolveAuction()
      .accounts({
        globalState: globalStatePda,
        leaderboard: leaderboardPda,
        region: regionPda,
        authority: authority.publicKey,
      } as any)
      .rpc();

    const state = await program.account.globalState.fetch(globalStatePda);
    expect(Object.keys(state.status)[0]).to.equal("active");

    const region = await program.account.regionAccount.fetch(regionPda);
    expect(region.factionOwner.toString()).to.equal(authority.publicKey.toString());
    expect(region.dominance).to.equal(100);
  });

  it("Processes income in Active status", async () => {
    // Wait for 5s turn duration
    console.log("Waiting 5s for turn to become ready...");
    await new Promise(resolve => setTimeout(resolve, 5500));

    await program.methods
      .advanceTurn()
      .accounts({
        globalState: globalStatePda,
        authority: authority.publicKey,
      } as any)
      .rpc();

    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      capitalMint,
      authority.publicKey
    );

    await program.methods
      .processRegionIncome()
      .accounts({
        globalState: globalStatePda,
        region: regionPda,
        capitalMint: capitalMint,
        destinationTokenAccount: ata.address,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    const balance = await provider.connection.getTokenAccountBalance(ata.address);
    // 1000000 - 5000 + 1000 = 996000
    expect(balance.value.amount).to.equal("996000");
  });

  it("Initializes a Prediction Market", async () => {
    const marketId = new anchor.BN(1);
    const liquidity = new anchor.BN(100);

    const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [yesMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("yes_mint"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [noMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("no_mint"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [capitalVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market_vault"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const creatorCapitalAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      capitalMint,
      authority.publicKey
    );

    await program.methods
      .initializeMarket(marketId, regionId, { macro: {} }, liquidity)
      .accounts({
        market: marketPda,
        yesMint: yesMintPda,
        noMint: noMintPda,
        capitalVault: capitalVaultPda,
        creator: authority.publicKey,
        creatorCapitalAccount: creatorCapitalAta.address,
        capitalMint: capitalMint,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();

    const marketState = await program.account.marketAccount.fetch(marketPda);
    expect(marketState.poolYes.toNumber()).to.equal(100);
    expect(marketState.poolNo.toNumber()).to.equal(100);
    expect(Object.keys(marketState.resolutionState)[0]).to.equal("unresolved");
  });

  it("Trades Shares on the AMM (Buys YES)", async () => {
    const marketId = new anchor.BN(1);
    const amountCapital = new anchor.BN(10); // Spend 10 $CAP
    
    const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [yesMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("yes_mint"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [noMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("no_mint"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [capitalVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market_vault"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const traderCapitalAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      capitalMint,
      authority.publicKey
    );

    const traderYesAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      yesMintPda,
      authority.publicKey
    );

    const traderNoAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      noMintPda,
      authority.publicKey
    );

    await program.methods
      .tradeShares(true, amountCapital) // Buy YES
      .accounts({
        market: marketPda,
        trader: authority.publicKey,
        traderCapitalAccount: traderCapitalAta.address,
        vaultTokenAccount: capitalVaultPda,
        yesMint: yesMintPda,
        noMint: noMintPda,
        traderYesAccount: traderYesAta.address,
        traderNoAccount: traderNoAta.address,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();

    const marketState = await program.account.marketAccount.fetch(marketPda);
    expect(marketState.poolNo.toNumber()).to.equal(110); // 100 + 10
    // new_pool_yes = ceil(10000 / 110) = 91
    expect(marketState.poolYes.toNumber()).to.equal(91);

    const balance = await provider.connection.getTokenAccountBalance(traderYesAta.address);
    // User gets: dx + dy = 10 + (100 - 91) = 19 shares
    expect(balance.value.amount).to.equal("19");
  });

  it("Resolves Market to YES and Claims Payout", async () => {
    const marketId = new anchor.BN(1);
    
    const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [yesMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("yes_mint"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [noMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("no_mint"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [capitalVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market_vault"), marketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // 1. Resolve Market to YES
    await program.methods
      .resolveMarket(true)
      .accounts({
        market: marketPda,
        globalState: globalStatePda,
        authority: authority.publicKey,
      } as any)
      .rpc();

    const marketState = await program.account.marketAccount.fetch(marketPda);
    expect(Object.keys(marketState.resolutionState)[0]).to.equal("resolvedYes");

    // 2. Claim Payout
    const userCapitalAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      capitalMint,
      authority.publicKey
    );

    const userWinningSharesAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      yesMintPda, // YES won
      authority.publicKey
    );

    const initialCapitalBalance = await provider.connection.getTokenAccountBalance(userCapitalAta.address);

    await program.methods
      .claimPayout()
      .accounts({
        market: marketPda,
        user: authority.publicKey,
        vaultTokenAccount: capitalVaultPda,
        userCapitalAccount: userCapitalAta.address,
        userWinningShares: userWinningSharesAta.address,
        winningMint: yesMintPda,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    const finalCapitalBalance = await provider.connection.getTokenAccountBalance(userCapitalAta.address);
    // User had 19 winning YES shares, should get 19 $CAP
    const earned = parseInt(finalCapitalBalance.value.amount) - parseInt(initialCapitalBalance.value.amount);
    expect(earned).to.equal(19);

    const finalSharesBalance = await provider.connection.getTokenAccountBalance(userWinningSharesAta.address);
    expect(finalSharesBalance.value.amount).to.equal("0"); // Shares burned
  });
});
