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
});
