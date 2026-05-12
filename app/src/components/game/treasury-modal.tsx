"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Coins, UserCircle2 } from "lucide-react";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useUserBalances } from "@/hooks/useUserBalances";

interface TreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TreasuryModal({ isOpen, onClose }: TreasuryModalProps) {
  const [solAmount, setSolAmount] = useState("0.1");
  const [newName, setNewName] = useState("");
  const [issubmitting, setIsSubmitting] = useState(false);
  const { program, connection } = useHegemony();
  const { publicKey } = useWallet();
  const { name: currentName, updateName, isLoading: profileLoading } = usePlayerProfile();
  const userBalances = useUserBalances();

  useEffect(() => {
    if (currentName) setNewName(currentName);
  }, [currentName]);

  const handleAirdrop = async () => {
    if (!publicKey || !connection) return;
    setIsSubmitting(true);
    try {
      const signature = await connection.requestAirdrop(publicKey, 2 * 1e9);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash
      });
      console.log("Airdrop successful: 2 SOL");
    } catch (err) {
      console.error("Airdrop failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async () => {
    if (!program || !publicKey) return;
    setIsSubmitting(true);
    try {
      const lamports = new anchor.BN(parseFloat(solAmount) * 1e9);
      const [globalStatePda] = PublicKey.findProgramAddressSync([Buffer.from("global_state")], program.programId);
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

  const handleUpdateName = async () => {
    if (!newName) return;
    setIsSubmitting(true);
    try {
      await updateName(newName);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!program || !publicKey) return;
    setIsSubmitting(true);
    try {
      const capUnits = new anchor.BN(parseFloat(solAmount) * 1000).mul(new anchor.BN(10).pow(new anchor.BN(9)));
      const [globalStatePda] = PublicKey.findProgramAddressSync([Buffer.from("global_state")], program.programId);
      const globalState = await program.account.globalState.fetch(globalStatePda);
      const userAta = getAssociatedTokenAddressSync(globalState.capitalMint, publicKey);

      await program.methods
        .withdrawSol(capUnits)
        .accounts({
          globalState: globalStatePda,
          capitalMint: globalState.capitalMint,
          treasury: globalState.treasury,
          user: publicKey,
          userCapitalAccount: userAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();

      console.log(`Successfully withdrew SOL from ${solAmount} * 1000 $CAP`);
      onClose();
    } catch (err) {
      console.error("Withdrawal failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
            <UserCircle2 className="w-5 h-5 text-cyan-500" />
            Neural Profile & Treasury
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-mono text-xs">
            Manage your on-chain identity and capital reserves.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* WALLET STATUS */}
          {userBalances.sol === 0 && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/50 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Funding Required</span>
              <p className="text-[9px] text-rose-400 font-mono">Your local wallet is empty. You must click "Airdrop Dev SOL" before you can initialize your profile or trade.</p>
            </div>
          )}

          <div className="flex justify-between items-center px-1">
             <span className="text-[10px] font-mono text-zinc-500 uppercase">Wallet Balance</span>
             <span className={`text-xs font-mono font-bold ${userBalances.sol === 0 ? 'text-rose-500' : 'text-cyan-400'}`}>
               {userBalances.sol.toFixed(2)} SOL
             </span>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* PROFILE SECTION */}
          <div className="space-y-3">
             <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Player Alias</label>
             <div className="flex gap-2">
                <Input 
                  placeholder="Set your name..." 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 font-mono text-cyan-400 text-xs h-9"
                />
                <Button 
                   onClick={handleUpdateName} 
                   disabled={issubmitting || profileLoading}
                   variant="outline"
                   className="border-cyan-900/50 text-cyan-500 text-[10px] font-bold h-9 uppercase px-4"
                >
                   Update
                </Button>
             </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* TREASURY SECTION */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                 <Coins className="w-3 h-3 text-amber-500" /> Capital Exchange
              </label>
              <div className="flex gap-2 items-center">
                <Input 
                  type="number" 
                  value={solAmount}
                  step="0.1"
                  min="0.01"
                  onChange={(e) => setSolAmount(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 font-mono text-amber-500 text-xs h-9"
                />
                <span className="text-xs font-mono text-zinc-400">SOL SCALE</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800 space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase">Exchange Rate</span>
                <span className="text-emerald-400 font-bold">{parseFloat(solAmount) * 1000} $CAP</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                disabled={issubmitting || !publicKey}
                onClick={handleAirdrop}
                variant="ghost"
                className="flex-1 border border-dashed border-cyan-800 text-cyan-600 hover:text-cyan-400 hover:bg-cyan-900/10 font-mono text-[9px] uppercase h-9"
              >
                 Airdrop Dev SOL
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                disabled={issubmitting || !publicKey}
                onClick={handleDeposit}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest text-[9px] h-9"
              >
                {issubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deposit SOL"}
              </Button>
              <Button 
                disabled={issubmitting || !publicKey}
                onClick={handleWithdraw}
                variant="outline"
                className="flex-1 border-rose-900 text-rose-500 hover:bg-rose-900/10 font-bold uppercase tracking-widest text-[9px] h-9"
              >
                {issubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Extract to SOL"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
