"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHegemony } from "@/lib/anchor/provider";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Loader2, Coins } from "lucide-react";

interface TreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TreasuryModal({ isOpen, onClose }: TreasuryModalProps) {
  const [solAmount, setSolAmount] = useState("0.1");
  const [issubmitting, setIsSubmitting] = useState(false);
  const { program } = useHegemony();
  const { publicKey } = useWallet();

  const handleDeposit = async () => {
    if (!program || !publicKey) return;
    setIsSubmitting(true);

    try {
      const lamports = new anchor.BN(parseFloat(solAmount) * 1e9);
      
      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global_state")],
        program.programId
      );

      const globalState = await program.account.globalState.fetch(globalStatePda);
      const userAta = getAssociatedTokenAddressSync(globalState.capitalMint, publicKey);
      
      await program.methods
        .depositSol(lamports)
        .accounts({
          globalState: globalStatePda,
          capitalMint: globalState.capitalMint,
          treasury: globalState.treasury,
          user: publicKey,
          userCapitalAccount: userAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        } as any)
        .rpc();

      console.log(`Successfully deposited ${solAmount} SOL`);
      onClose();
    } catch (err) {
      console.error("Deposit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            Capital Exchange
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-mono text-xs">
            Convert SOL to $CAP (Hegemony Arcade Token). Rate: 1 SOL = 1,000 $CAP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase">SOL Amount</label>
            <div className="flex gap-2 items-center">
              <Input 
                type="number" 
                value={solAmount}
                step="0.1"
                min="0.01"
                onChange={(e) => setSolAmount(e.target.value)}
                className="bg-zinc-900 border-zinc-800 font-mono text-amber-500"
              />
              <span className="text-xs font-mono text-zinc-400">SOL</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-zinc-500 uppercase">You Receive</span>
              <span className="text-emerald-400 font-bold">{parseFloat(solAmount) * 1000} $CAP</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            disabled={issubmitting || !publicKey}
            onClick={handleDeposit}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest text-xs h-10"
          >
            {issubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
