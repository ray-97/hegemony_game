import { 
  ActionPostResponse, 
  ACTIONS_CORS_HEADERS, 
  createPostResponse, 
  ActionGetResponse, 
  ActionPostRequest 
} from "@solana/actions";
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram 
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from "@/lib/anchor/hegemony.json";
import { Hegemony } from "@/lib/anchor/hegemony";

const PROGRAM_ID = new PublicKey("79yvXQvVyqMYy4ofqKQD1CZXQSyH5eJ7dHT6ZZuXg7ND");

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    title: "HEGEMONY: Support Your Faction",
    icon: "https://hegemony.game/blink-banner.png", // Placeholder
    description: "Delegate your Capital to a regional leader during the Pre-Epoch auction. Win the match, share the yield.",
    label: "Delegate 100 $CAP",
    links: {
      actions: [
        {
          label: "Delegate 100 $CAP",
          href: "/api/actions/delegate?amount=100&region=1",
        },
        {
          label: "Delegate 500 $CAP",
          href: "/api/actions/delegate?amount=500&region=1",
        },
        {
          label: "Custom Amount",
          href: "/api/actions/delegate?amount={amount}&region=1",
          parameters: [
            {
              name: "amount",
              label: "Enter $CAP amount",
              required: true,
            }
          ]
        }
      ]
    }
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE OPTIONS METHOD FOR CORS
export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const body: ActionPostRequest = await req.json();
    const account = new PublicKey(body.account);
    
    const url = new URL(req.url);
    const amountStr = url.searchParams.get("amount") ?? "100";
    const regionId = parseInt(url.searchParams.get("region") ?? "1");
    const amount = new anchor.BN(amountStr);

    const connection = new Connection("http://localhost:8899", "confirmed");
    
    // We need to build the 'delegate_to_bidder' transaction
    // This is a simplified version for the MVP Blink
    
    // 1. Setup Anchor bits (without a real wallet, just for encoding)
    const provider = new anchor.AnchorProvider(connection, {} as any, {
      commitment: "confirmed",
    });
    const program = new anchor.Program(idl as any as Hegemony, PROGRAM_ID, provider);

    // 2. Derive PDAs
    const [globalStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      PROGRAM_ID
    );

    // Find the current leader of the region to delegate to
    const [leaderboardPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("leaderboard"), Buffer.from([regionId])],
      PROGRAM_ID
    );
    const leaderboard = await program.account.regionLeaderboard.fetch(leaderboardPda);
    const leader = leaderboard.currentLeader;

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), leader.toBuffer(), Buffer.from([regionId])],
      PROGRAM_ID
    );

    const [delegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), account.toBuffer(), escrowPda.toBuffer()],
      PROGRAM_ID
    );

    // Get Token Accounts (Simplified: assuming they exist or handled by instruction)
    // Note: In real Blink, we'd need to find the ATAs
    const { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
    const capitalMint = (await program.account.globalState.fetch(globalStatePda)).capitalMint;
    const userAta = getAssociatedTokenAddressSync(capitalMint, account);
    const vaultAta = getAssociatedTokenAddressSync(capitalMint, globalStatePda, true);

    // 3. Build Instruction
    const ix = await program.methods
      .delegateToBidder(amount)
      .accounts({
        globalState: globalStatePda,
        leaderboard: leaderboardPda,
        escrow: escrowPda,
        delegationRecord: delegationPda,
        delegate: account,
        delegateTokenAccount: userAta,
        vaultTokenAccount: vaultAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .instruction();

    const transaction = new Transaction().add(ix);
    transaction.feePayer = account;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Delegated ${amountStr} $CAP to Region ${regionId} Leader.`,
      },
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};
