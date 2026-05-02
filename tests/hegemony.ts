import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hegemony } from "../target/types/hegemony";
import { createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { expect } from "chai";

describe("hegemony", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Hegemony as Program<Hegemony>;
  const authority = provider.wallet as anchor.Wallet;

  let globalStatePda: anchor.web3.PublicKey;
  let regionPda: anchor.web3.PublicKey;
  let capitalMint: anchor.web3.PublicKey;
  let treasury = anchor.web3.Keypair.generate();

  before(async () => {
    [globalStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      program.programId
    );

    [regionPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("region"), Buffer.from([1])],
      program.programId
    );

    capitalMint = await createMint(
      provider.connection,
      authority.payer,
      globalStatePda, // Program is mint authority
      null,
      9
    );
  });

  it("Initializes Global State", async () => {
    const epochDuration = new anchor.BN(86400 * 30); // 30 days
    await program.methods
      .initializeGlobalState(epochDuration)
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
    expect(state.turn).to.equal(0);
    expect(state.isActive).to.be.true;
  });

  it("Initializes a Region", async () => {
    const regionId = 1;
    const resourceYield = new anchor.BN(1000);
    await program.methods
      .initializeRegion(regionId, resourceYield)
      .accounts({
        region: regionPda,
        globalState: globalStatePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const region = await program.account.regionAccount.fetch(regionPda);
    expect(region.id).to.equal(1);
    expect(region.resourceYield.toNumber()).to.equal(1000);
    expect(region.dominance).to.equal(0);
  });

  it("Sets Region Owner", async () => {
    await program.methods
      .setRegionOwner(authority.publicKey)
      .accounts({
        region: regionPda,
        globalState: globalStatePda,
        authority: authority.publicKey,
      } as any)
      .rpc();

    const region = await program.account.regionAccount.fetch(regionPda);
    expect(region.factionOwner.toString()).to.equal(authority.publicKey.toString());
    expect(region.dominance).to.equal(100);
  });

  it("Fails to advance turn too early", async () => {
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
      expect(err.toString()).to.contain("TurnNotReady");
    }
  });

  it("Processes income cycle", async () => {
    // Wait for 5s turn duration
    console.log("Waiting 5s for turn to become ready...");
    await new Promise(resolve => setTimeout(resolve, 5500));

    // 1. Advance Turn
    await program.methods
      .advanceTurn()
      .accounts({
        globalState: globalStatePda,
        authority: authority.publicKey,
      } as any)
      .rpc();

    // 2. Setup Destination ATA
    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority.payer,
      capitalMint,
      authority.publicKey
    );

    // 3. Process Income
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

    // 4. Verify Balance
    // Yield = 1000 * (1 + 0) * (100 / 100) = 1000
    const balance = await provider.connection.getTokenAccountBalance(ata.address);
    expect(balance.value.amount).to.equal("1000");

    // 5. Verify Double Claim Prevention
    try {
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
      expect.fail("Should have failed");
    } catch (err) {
      expect(err.toString()).to.contain("IncomeAlreadyProcessed");
    }
  });
});
