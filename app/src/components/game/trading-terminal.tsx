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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Info, Zap, AlertTriangle } from "lucide-react";
import { useHegemony } from "@/lib/anchor/provider";
import * as anchor from "@coral-xyz/anchor";

import { useWallet } from "@solana/wallet-adapter-react";
import { useUserBalances } from "@/hooks/useUserBalances";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Loader2, UserPlus, Coins, BarChart3 } from "lucide-react";

interface TradingTerminalProps {
  regionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TradingTerminal({ regionId, isOpen, onClose }: TradingTerminalProps) {
  const [amount, setAmount] = useState(100);
  const [issubmitting, setIsSubmitting] = useState(false);
  const [hasDiplomacy, setHasDiplomacy] = useState(false);
  const [userHomeRegionId, setUserHomeRegionId] = useState<number | null>(null);
  const { program } = useHegemony();
  const { publicKey } = useWallet();
  const userBalances = useUserBalances();

  const regionBonds = regionId ? (userBalances.bonds[regionId] || 0) : 0;

  // Check if user has diplomacy in ANY region
  useEffect(() => {
    if (!program || !publicKey) return;
    
    const checkGlobalDiplomacy = async () => {
      const [diplomacyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("diplomacy"), publicKey.toBuffer()],
        program.programId
      );
      try {
        const account = await program.account.diplomaticInfluenceAccount.fetch(diplomacyPda);
        setHasDiplomacy(account.regionId === regionId);
        setUserHomeRegionId(account.regionId);
      } catch {
        setHasDiplomacy(false);
        setUserHomeRegionId(null);
      }
    };
    checkGlobalDiplomacy();
  }, [program, publicKey, regionId]);

  const handleJoinFaction = async () => {
    console.log("Join Faction clicked for region:", regionId);
    if (!program || !publicKey || !regionId) {
      console.log("Missing requirements:", { program: !!program, publicKey: !!publicKey, regionId });
      return;
    }
    if (userHomeRegionId !== null) {
      console.log("Already a citizen of:", userHomeRegionId);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Deriving PDAs...");
      const [regionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("region"), Buffer.from([regionId])],
        program.programId
      );
      const [diplomacyPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("diplomacy"), publicKey.toBuffer()],
        program.programId
      );

      console.log("Executing initializeDiplomacy rpc...");
      const tx = await program.methods
        .initializeDiplomacy(regionId)
        .accounts({
          diplomacy: diplomacyPda,
          region: regionPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
      
      console.log("Citizenship confirmed! TX:", tx);
      setHasDiplomacy(true);
      setUserHomeRegionId(regionId);
    } catch (err) {
      console.error("CRITICAL: Failed to join faction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStake = async () => {
    if (!program || !publicKey || !regionId) return;
    setIsSubmitting(true);
    console.log(`Attempting to stake ${amount} $CAP in region ${regionId}...`);
    try {
      const [globalStatePda] = PublicKey.findProgramAddressSync([Buffer.from("global_state")], program.programId);
      const globalState = await program.account.globalState.fetch(globalStatePda);
      const [regionPda] = PublicKey.findProgramAddressSync([Buffer.from("region"), Buffer.from([regionId])], program.programId);
      const regionAccount = await program.account.regionAccount.fetch(regionPda);
      const [bondMintPda] = PublicKey.findProgramAddressSync([Buffer.from("bond_mint"), Buffer.from([regionId])], program.programId);
      
      const userCapitalAta = getAssociatedTokenAddressSync(globalState.capitalMint, publicKey);
      const userBondAta = getAssociatedTokenAddressSync(bondMintPda, publicKey);

      // Convert UI amount to raw units (9 decimals)
      const rawAmount = new anchor.BN(amount).mul(new anchor.BN(10).pow(new anchor.BN(9)));

      const tx = await program.methods
        .stakeCapital(rawAmount)
        .accounts({
          globalState: globalStatePda,
          region: regionPda,
          bondMint: bondMintPda,
          bondVault: regionAccount.bondVault,
          user: publicKey,
          userCapitalAccount: userCapitalAta,
          userBondAccount: userBondAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        } as any)
        .rpc();
      
      console.log("Staking successful:", tx);
    } catch (err: any) {
      console.error("Staking failed:", err);
      if (err.logs) console.log("Logs:", err.logs);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prices simulated for UI
  const priceYes = 0.45;
  const priceNo = 0.55;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 text-[10px]">OPERATIONAL TERMINAL</Badge>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight uppercase">
            Region 00{regionId} Command
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="trade" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border-zinc-800">
            <TabsTrigger value="trade" className="text-[10px] uppercase font-bold">Market</TabsTrigger>
            <TabsTrigger value="bonds" className="text-[10px] uppercase font-bold">Bonds</TabsTrigger>
            <TabsTrigger value="intel" className="text-[10px] uppercase font-bold">Intel</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-emerald-500/20">
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Support (YES)</div>
                <div className="text-2xl font-bold text-emerald-400">${priceYes}</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-rose-500/20">
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Oppose (NO)</div>
                <div className="text-2xl font-bold text-rose-400">${priceNo}</div>
              </div>
            </div>

            <div className="space-y-4">
              <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="bg-zinc-900 border-zinc-800 font-mono text-cyan-400" />
              <div className="flex gap-2">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold h-10">BUY YES</Button>
                <Button variant="outline" className="flex-1 border-rose-900 text-rose-500 text-[10px] font-bold h-10">BUY NO</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bonds" className="pt-4 space-y-6">
             {!hasDiplomacy ? (
               <div className="py-8 text-center space-y-4">
                 {userHomeRegionId !== null ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                       <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
                       <p className="text-[10px] text-amber-500 font-mono uppercase font-bold tracking-tight">Passport Lock Active</p>
                       <p className="text-[10px] text-zinc-500 font-mono leading-tight px-4">
                         You are already a citizen of Region 00{userHomeRegionId}. 
                         Hegemony protocols prohibit dual citizenship.
                       </p>
                    </div>
                 ) : (
                    <>
                      <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Unregistered Entity</p>
                      <Button onClick={handleJoinFaction} disabled={issubmitting} className="bg-cyan-600 hover:bg-cyan-500 text-[10px] font-bold w-full h-10 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        {issubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" /> Accept Regional Citizenship</>}
                      </Button>
                    </>
                 )}
               </div>
             ) : (
               <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Diplomatic Status</div>
                      <div className="text-sm font-bold text-cyan-400 uppercase tracking-widest text-emerald-400">Verified Citizen</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Your Bonds</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono">{regionBonds.toLocaleString()} $BOND</div>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Stake $CAP for Yield Bonds</label>
                    <div className="flex gap-2">
                      <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="bg-zinc-900 border-zinc-800 font-mono text-cyan-400" />
                      <Button onClick={handleStake} disabled={issubmitting} className="bg-zinc-100 text-black hover:bg-white text-[10px] font-bold h-10 px-6">
                        {issubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "STAKE"}
                      </Button>
                    </div>
                    <p className="text-[9px] text-zinc-600 font-mono italic">Bonds earn a share of the region's resource yield every Turn.</p>
                 </div>
               </div>
             )}
          </TabsContent>

          <TabsContent value="intel" className="pt-4 space-y-4">
             <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-zinc-500 shrink-0" />
                <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                  Region 00{regionId} Operational Context:
                  <br /><br />
                  • ENERGY: Determines base $CAP yield per turn.
                  <br />
                  • TECHNOLOGY: Reduces build costs and DI maintenance.
                  <br />
                  • LOGISTICS: Generates passive Diplomatic Influence.
                </p>
             </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
