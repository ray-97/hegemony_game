"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Users2, ExternalLink, Loader2, ShieldCheck, Landmark } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useHegemony } from "@/lib/anchor/provider";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface PreEpochDashboardProps {
  regionId: number;
}

const REGIONAL_CANDIDATES: Record<number, string> = {
  1: "Warlord Wes",
  2: "Don Tzu",
  3: "Count de Monet",
  4: "Sheikh-and-Bake",
  5: "Frontier Frank",
};

export function PreEpochDashboard({ regionId }: PreEpochDashboardProps) {
  const { program } = useHegemony();
  const { publicKey } = useWallet();
  const leaderboard = useLeaderboard(regionId);
  const [bidAmount, setBidAmount] = useState(5000);
  const [delegateAmount, setDelegateAmount] = useState(1000);
  const [manifesto, setManifesto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBid = async () => {
    if (!program || !publicKey) return;
    setIsSubmitting(true);
    try {
      const [globalStatePda] = PublicKey.findProgramAddressSync([Buffer.from("global_state")], program.programId);
      const [leaderboardPda] = PublicKey.findProgramAddressSync([Buffer.from("leaderboard"), Buffer.from([regionId])], program.programId);
      const [escrowPda] = PublicKey.findProgramAddressSync([Buffer.from("escrow"), publicKey.toBuffer(), Buffer.from([regionId])], program.programId);
      
      const gState = await program.account.globalState.fetch(globalStatePda);
      const userAta = getAssociatedTokenAddressSync(gState.capitalMint, publicKey);
      const vaultAta = getAssociatedTokenAddressSync(gState.capitalMint, globalStatePda, true);

      const rawAmount = new anchor.BN(bidAmount).mul(new anchor.BN(10).pow(new anchor.BN(9)));

      await program.methods
        .submitManifestoBid(regionId, rawAmount, manifesto || "https://hegemony.game/manifesto/default")
        .accounts({
          globalState: globalStatePda,
          leaderboard: leaderboardPda,
          escrow: escrowPda,
          bidder: publicKey,
          bidderTokenAccount: userAta,
          vaultTokenAccount: vaultAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
      
      console.log("Bid confirmed");
    } catch (err) {
      console.error("Bid failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelegate = async () => {
    if (!program || !publicKey || !leaderboard?.currentLeader || leaderboard.currentLeader === "None") return;
    setIsSubmitting(true);
    try {
      const leaderPubkey = new PublicKey(leaderboard.currentLeader);
      const [globalStatePda] = PublicKey.findProgramAddressSync([Buffer.from("global_state")], program.programId);
      const [leaderboardPda] = PublicKey.findProgramAddressSync([Buffer.from("leaderboard"), Buffer.from([regionId])], program.programId);
      const [escrowPda] = PublicKey.findProgramAddressSync([Buffer.from("escrow"), leaderPubkey.toBuffer(), Buffer.from([regionId])], program.programId);
      
      const [delegationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("delegation"), publicKey.toBuffer(), escrowPda.toBuffer()],
        program.programId
      );

      const gState = await program.account.globalState.fetch(globalStatePda);
      const userAta = getAssociatedTokenAddressSync(gState.capitalMint, publicKey);
      const vaultAta = getAssociatedTokenAddressSync(gState.capitalMint, globalStatePda, true);

      const rawAmount = new anchor.BN(delegateAmount).mul(new anchor.BN(10).pow(new anchor.BN(9)));

      await program.methods
        .delegateToBidder(rawAmount)
        .accounts({
          globalState: globalStatePda,
          leaderboard: leaderboardPda,
          escrow: escrowPda,
          delegationRecord: delegationPda,
          delegate: publicKey,
          delegateTokenAccount: userAta,
          vaultTokenAccount: vaultAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
      
      console.log("Delegation confirmed");
    } catch (err) {
      console.error("Delegation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: GLOBAL STANDINGS */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Current Hegemon Pipeline</CardTitle>
            <Crown className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-zinc-800">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Primary Candidate</span>
              <div className="text-xs font-mono text-cyan-400 truncate max-w-[200px]">
                {leaderboard?.leaderName 
                  ? leaderboard.leaderName 
                  : (leaderboard?.currentLeader === "None" || leaderboard?.currentLeader === "11111111111111111111111111111111" || !leaderboard?.currentLeader 
                    ? REGIONAL_CANDIDATES[regionId] || "Anonymous" 
                    : leaderboard.currentLeader)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Weight</span>
              <div className="text-lg font-bold text-zinc-100">{leaderboard?.totalBidWeight.toLocaleString()} $CAP</div>
            </div>
          </div>
          
          {leaderboard?.manifestoUri && leaderboard.manifestoUri !== "" && (
            <Button variant="ghost" className="w-full text-[10px] text-zinc-500 hover:text-cyan-400 justify-start h-8 px-2 border border-dashed border-zinc-800">
               <ExternalLink className="w-3 h-3 mr-2" /> View Regional Manifesto
            </Button>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: SOVEREIGN CANDIDACY (THE WHALES) */}
      <div className="space-y-4 p-4 rounded-xl border border-amber-500/10 bg-amber-500/5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Sovereign Candidate Terminal</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-tight mb-4">
          Stake a massive principal and publish your strategic vision. The highest bidder at Turn 1 becomes the region's State Actor.
        </p>
        
        <div className="space-y-3">
           <div className="flex gap-2">
             <div className="relative flex-1">
               <Input 
                 type="number" 
                 value={bidAmount} 
                 onChange={(e) => setBidAmount(Number(e.target.value))} 
                 className="bg-black border-zinc-800 font-mono text-amber-500 h-9 pr-10" 
               />
               <span className="absolute right-3 top-2 text-[9px] font-mono text-zinc-600">$CAP</span>
             </div>
             <Button onClick={handleBid} disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold h-9 px-6 tracking-widest shadow-[0_0_10px_rgba(217,119,6,0.2)]">
                SUBMIT BID
             </Button>
           </div>
           <Input 
             placeholder="Manifesto Arweave/IPFS Link" 
             value={manifesto}
             onChange={(e) => setManifesto(e.target.value)}
             className="bg-black border-zinc-800 font-mono text-xs text-zinc-300 h-9" 
           />
           <p className="text-[9px] text-zinc-600 font-mono italic">Note: Bidding requires liquid $CAP. Winning bids are locked into the Epoch Prize Pool.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-[9px] font-mono text-zinc-600 uppercase">OR</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* SECTION 3: CITIZEN DELEGATION (THE RETAIL) */}
      <div className="space-y-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-center gap-2 mb-2">
          <Landmark className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-500">Citizen Support Terminal</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-tight mb-4">
          Support the current frontrunner to increase their bid weight. Successful delegators share 100% of the Epoch's victory yield.
        </p>

        <div className="flex gap-2">
           <div className="relative flex-1">
             <Input 
               type="number" 
               value={delegateAmount} 
               onChange={(e) => setDelegateAmount(Number(e.target.value))} 
               className="bg-black border-zinc-800 font-mono text-cyan-400 h-9 pr-10" 
             />
             <span className="absolute right-3 top-2 text-[9px] font-mono text-zinc-600">$CAP</span>
           </div>
           <Button 
              onClick={handleDelegate} 
              disabled={isSubmitting || !leaderboard?.currentLeader || leaderboard.currentLeader === "None"}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold h-9 px-6 tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]"
           >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : `DELEGATE TO ${leaderboard?.currentLeader?.slice(0, 8)}...`}
           </Button>
        </div>
      </div>
    </div>
  );
}
