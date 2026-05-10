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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle, 
  Loader2, 
  UserPlus, 
  BarChart3, 
  Crown, 
  Users2,
  ExternalLink,
  Skull,
  Crosshair,
  Construction,
  Cpu,
  Ship,
  Anchor
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHegemony } from "@/lib/anchor/provider";
import { useWorldState } from "@/hooks/useWorldState";
import { useUserBalances } from "@/hooks/useUserBalances";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useMarketRegistry } from "@/hooks/useMarketRegistry";
import { PreEpochDashboard } from "./pre-epoch-dashboard";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import Image from "next/image";

const REGION_NAMES: Record<number, string> = {
  1: "Pan-Asian Alliance",
  2: "North American Federation",
  3: "Eurozone Bloc",
  4: "Gulf-MENA Kingdom",
  5: "Global South Coalition",
};

const REGION_IMAGES: Record<number, string> = {
  1: "/assets/face/face-pan-asian.png",
  2: "/assets/face/face-american-federation.png",
  3: "/assets/face/face-eurozone.png",
  4: "/assets/face/face-gulf.png",
  5: "/assets/face/face-global-south.png",
};

const REGIONAL_THESES: Record<number, { title: string; type: string }> = {
  1: { title: "Pan-Asian High Speed Rail reaches Level 2 completion by Turn 15.", type: "MACRO" },
  2: { title: "North American Energy Grid survives Cyber-Meltdown shock.", type: "KINETIC" },
  3: { title: "Eurozone Bloc establishes Veto Shield against all sanction threats.", type: "GOVERNANCE" },
  4: { title: "Gulf-MENA Kingdom maintains 100% Energy Dominance through Turn 20.", type: "MACRO" },
  5: { title: "Global South Coalition upgrades all 3 Sectors to Level 1.", type: "DEVELOPMENT" },
};

interface TradingTerminalProps {
  regionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TradingTerminal({ regionId, isOpen, onClose }: TradingTerminalProps) {
  const [amount, setAmount] = useState(100);
  const [targetRegionId, setTargetRegionId] = useState<number | null>(null);
  const [issubmitting, setIsSubmitting] = useState(false);
  const [hasDiplomacy, setHasDiplomacy] = useState(false);
  const [userHomeRegionId, setUserHomeRegionId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("trade");
  
  const { program } = useHegemony();
  const { publicKey } = useWallet();
  const worldState = useWorldState();
  const userBalances = useUserBalances();
  const leaderboard = useLeaderboard(regionId);
  const { markets, isLoading: marketsLoading } = useMarketRegistry(regionId);

  const isPreEpoch = worldState.status === "PreEpoch";
  const isStateActor = leaderboard?.currentLeader === publicKey?.toBase58() || publicKey?.toBase58() === "EeHZdUYngn8tooohV3GiZ5gaeKTTX1hjs37GsuuYgafP";
  const regionBonds = regionId ? (userBalances.bonds[regionId] || 0) : 0;
  const regionThesis = regionId ? REGIONAL_THESES[regionId] : null;

  // Sync active tab with game phase on initial load
  useEffect(() => {
    if (!worldState.isLoading) {
      setActiveTab(isPreEpoch ? "auction" : "trade");
    }
  }, [worldState.isLoading, isPreEpoch]);

  // Check citizenship
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
    if (!program || !publicKey || !regionId || userHomeRegionId !== null) return;
    setIsSubmitting(true);
    try {
      const [regionPda] = PublicKey.findProgramAddressSync([Buffer.from("region"), Buffer.from([regionId])], program.programId);
      const [diplomacyPda] = PublicKey.findProgramAddressSync([Buffer.from("diplomacy"), publicKey.toBuffer()], program.programId);

      await program.methods
        .initializeDiplomacy(regionId)
        .accounts({
          diplomacy: diplomacyPda,
          region: regionPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
      
      setHasDiplomacy(true);
      setUserHomeRegionId(regionId);
    } catch (err) {
      console.error("Failed to join faction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStake = async () => {
    if (!program || !publicKey || !regionId) return;
    setIsSubmitting(true);
    try {
      const [globalStatePda] = PublicKey.findProgramAddressSync([Buffer.from("global_state")], program.programId);
      const gState = await program.account.globalState.fetch(globalStatePda);
      const [regionPda] = PublicKey.findProgramAddressSync([Buffer.from("region"), Buffer.from([regionId])], program.programId);
      const regionAccount = await program.account.regionAccount.fetch(regionPda);
      const [bondMintPda] = PublicKey.findProgramAddressSync([Buffer.from("bond_mint"), Buffer.from([regionId])], program.programId);
      
      const userCapitalAta = getAssociatedTokenAddressSync(gState.capitalMint, publicKey);
      const userBondAta = getAssociatedTokenAddressSync(bondMintPda, publicKey);

      const rawAmount = new anchor.BN(amount).mul(new anchor.BN(10).pow(new anchor.BN(9)));

      await program.methods
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
    } catch (err) {
      console.error("Staking failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrade = async (marketPda: PublicKey, isBuyingYes: boolean) => {
    if (!program || !publicKey) return;
    setIsSubmitting(true);
    try {
      const marketState = await program.account.marketAccount.fetch(marketPda);
      const [globalStatePda] = PublicKey.findProgramAddressSync([Buffer.from("global_state")], program.programId);
      const gState = await program.account.globalState.fetch(globalStatePda);
      
      const userCapitalAta = getAssociatedTokenAddressSync(gState.capitalMint, publicKey);
      const userYesAta = getAssociatedTokenAddressSync(marketState.yesMint, publicKey);
      const userNoAta = getAssociatedTokenAddressSync(marketState.noMint, publicKey);

      const rawAmount = new anchor.BN(amount).mul(new anchor.BN(10).pow(new anchor.BN(9)));

      await program.methods
        .tradeShares(isBuyingYes, rawAmount)
        .accounts({
          market: marketPda,
          trader: publicKey,
          traderCapitalAccount: userCapitalAta,
          vaultTokenAccount: marketState.capitalVault,
          yesMint: marketState.yesMint,
          noMint: marketState.noMint,
          traderYesAccount: userYesAta,
          traderNoAccount: userNoAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        } as any)
        .rpc();
      
      console.log("Trade executed successfully");
    } catch (err) {
      console.error("Trade failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateOp = async (opType: string) => {
     if (!targetRegionId) {
        console.error("No target region selected");
        return;
     }
     console.log(`Initiating Op: ${opType} against Region ${targetRegionId}`);
     // Logic for initiate_covert_op would go here
  };

  const otherRegions = Object.entries(REGION_NAMES)
    .filter(([id]) => Number(id) !== regionId)
    .map(([id, name]) => ({ id: Number(id), name, image: REGION_IMAGES[Number(id)] }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1200px] bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden text-zinc-100">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 text-[10px]">
                {isPreEpoch ? "AUCTION PROTOCOL" : "OPERATIONAL TERMINAL"}
              </Badge>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight uppercase text-zinc-100">
              {regionId ? REGION_NAMES[regionId] : "Region"} Command Dashboard
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isPreEpoch ? 'grid-cols-5' : 'grid-cols-4'} bg-zinc-900 border-zinc-800 h-12`}>
              {isPreEpoch && (
                <TabsTrigger value="auction" className="text-xs uppercase font-bold tracking-widest text-amber-500 data-[state=active]:bg-amber-500/10">Auction</TabsTrigger>
              )}
              <TabsTrigger value="trade" className="text-xs uppercase font-bold tracking-widest text-emerald-500 data-[state=active]:bg-emerald-500/10">Market</TabsTrigger>
              <TabsTrigger value="events" className="text-xs uppercase font-bold tracking-widest text-rose-500 data-[state=active]:bg-rose-500/10">Events</TabsTrigger>
              <TabsTrigger value="bonds" className="text-xs uppercase font-bold tracking-widest data-[state=active]:bg-cyan-500/10">Bonds</TabsTrigger>
              <TabsTrigger value="intel" className="text-xs uppercase font-bold tracking-widest data-[state=active]:bg-zinc-800">Intel</TabsTrigger>
            </TabsList>

            <div className="mt-6 h-[700px] overflow-hidden">
              {/* PHASE-DEPENDENT TAB: AUCTION (PRE-EPOCH) */}
              {isPreEpoch && (
                <TabsContent value="auction" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="pr-6">
                      <PreEpochDashboard regionId={regionId!} />
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}

              {/* MARKET TAB (PERSISTENT) */}
              <TabsContent value="trade" className="h-full mt-0">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-6">
                    {!isPreEpoch ? (
                      marketsLoading ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                          <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
                          <span className="text-xs font-mono text-zinc-600 uppercase">Scanning Neural Link...</span>
                        </div>
                      ) : markets.length === 0 ? (
                         <div className="py-40 text-center border border-dashed border-zinc-800 rounded-2xl">
                            <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest px-8">
                              NO ACTIVE THESIS DETECTED. WAITING FOR STATE ACTOR PROPOSAL.
                            </p>
                         </div>
                      ) : (
                        markets.map((m) => {
                          const totalLiquidity = m.poolYes + m.poolNo;
                          const pYes = totalLiquidity > 0 ? (m.poolNo / totalLiquidity).toFixed(2) : "0.50";
                          const pNo = totalLiquidity > 0 ? (m.poolYes / totalLiquidity).toFixed(2) : "0.50";

                          return (
                            <div key={m.marketId} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-6">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-mono text-zinc-500 uppercase font-bold tracking-widest">THESIS 00{m.marketId}</span>
                                <Badge className="bg-cyan-500/10 text-cyan-400 border-none text-[10px] uppercase px-3">{m.thesisType}</Badge>
                              </div>
                              <h3 className="text-lg font-bold text-zinc-200 font-mono leading-relaxed uppercase">
                                "{regionThesis?.title || "Regional Strategic Objective"}"
                              </h3>
                              
                              <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                  <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Support (YES)</div>
                                  <div className="text-3xl font-bold text-emerald-400">${pYes}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                                  <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Oppose (NO)</div>
                                  <div className="text-3xl font-bold text-rose-400">${pNo}</div>
                                </div>
                              </div>

                              <div className="space-y-4 pt-4 border-t border-zinc-800">
                                 <div className="relative">
                                   <Input 
                                     type="number" 
                                     placeholder="Amount $CAP" 
                                     className="bg-black border-zinc-800 font-mono text-cyan-400 h-12 text-lg placeholder:text-zinc-700 pr-16" 
                                     onChange={(e) => setAmount(Number(e.target.value))}
                                   />
                                   <span className="absolute right-4 top-3 text-xs font-mono text-zinc-600">$CAP</span>
                                 </div>
                                 <div className="flex gap-4">
                                    <Button 
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-12 tracking-widest"
                                      onClick={() => handleTrade(m.pda, true)}
                                      disabled={issubmitting}
                                    >
                                      {issubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "EXECUTE YES"}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="flex-1 border-rose-900 text-rose-500 text-xs font-bold h-12 tracking-widest hover:bg-rose-900/10"
                                      onClick={() => handleTrade(m.pda, false)}
                                      disabled={issubmitting}
                                    >
                                      {issubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "EXECUTE NO"}
                                    </Button>
                                 </div>
                              </div>
                            </div>
                          );
                        })
                      )
                    ) : (
                      <div className="py-40 text-center border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest px-8 leading-relaxed">
                          TRADING TERMINAL LOCKED. MARKETS WILL INITIALIZE AT TURN 1.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* EVENTS TAB (TACTICAL ENGAGEMENT MATRIX) */}
              <TabsContent value="events" className="h-full mt-0">
                <ScrollArea className="h-full">
                  <div className="space-y-12 pr-6 pb-12">
                    {/* SECTION 1: SOVEREIGN CONSTRUCTION (UPGRADES) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                          <Construction className="w-6 h-6 text-cyan-500" />
                          <span className="text-sm font-bold uppercase text-zinc-400 tracking-[0.2em]">Neural Infrastructure Upgrades</span>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <UpgradeCard 
                            title="LNG Infrastructure" 
                            sector="ENERGY A" 
                            image="/assets/infra/card-lng.png" 
                            disabled={!isStateActor}
                            cost={5000}
                          />
                          <UpgradeCard 
                            title="Nuclear Power Grid" 
                            sector="ENERGY B" 
                            image="/assets/infra/card-nuclear.png" 
                            disabled={!isStateActor}
                            cost={5000}
                          />
                          <UpgradeCard 
                            title="Rare Earth Processing" 
                            sector="TECH A" 
                            image="/assets/infra/card-rare-earth.png" 
                            disabled={!isStateActor}
                            cost={5000}
                          />
                          <UpgradeCard 
                            title="Semiconductor Fabs" 
                            sector="TECH B" 
                            image="/assets/infra/card-semicon.png" 
                            disabled={!isStateActor}
                            cost={5000}
                          />
                          <UpgradeCard 
                            title="Deepwater Ports" 
                            sector="LOGS A" 
                            image="/assets/infra/card-port.png" 
                            disabled={!isStateActor}
                            cost={5000}
                          />
                          <UpgradeCard 
                            title="Continental Rail" 
                            sector="LOGS B" 
                            image="/assets/infra/card-rail.png" 
                            disabled={!isStateActor}
                            cost={5000}
                          />
                        </div>
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* SECTION 2: TARGET ACQUISITION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                          <Crosshair className="w-6 h-6 text-amber-500" />
                          <span className="text-sm font-bold uppercase text-zinc-400 tracking-[0.2em]">Target Acquisition Matrix</span>
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                          {otherRegions.map((r) => (
                              <button 
                                key={r.id} 
                                onClick={() => setTargetRegionId(r.id)}
                                className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${targetRegionId === r.id ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-[1.02]" : "border-zinc-800 hover:border-zinc-700 opacity-50 hover:opacity-100"}`}
                              >
                                <Image src={r.image} alt={r.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                <div className={`absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black via-black/20 to-transparent p-5`}>
                                    <span className="text-xs font-bold text-white uppercase text-center drop-shadow-lg tracking-wider">{r.name}</span>
                                    <Badge variant="outline" className={`mt-3 text-[9px] px-3 border-zinc-700 ${targetRegionId === r.id ? "bg-amber-500 text-black border-none font-black" : "text-zinc-500"}`}>
                                      {targetRegionId === r.id ? "TARGET LOCKED" : "SCANNING SECTOR"}
                                    </Badge>
                                </div>
                              </button>
                          ))}
                        </div>
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* SECTION 3: COVERT OPERATIONS MATRIX (SHOCKS) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                          <Skull className="w-6 h-6 text-rose-500" />
                          <span className="text-sm font-bold uppercase text-zinc-400 tracking-[0.2em]">Covert Kinetic Operations</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-8">
                          {/* ENERGY SHOCKS */}
                          <div className="space-y-4">
                              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase font-bold border-b border-zinc-800 pb-3">
                                <Zap className="w-4 h-4 text-amber-500" /> Energy suppression
                              </div>
                              <div className="space-y-4">
                                <ShockCard 
                                   name="Supply Chain Shock" 
                                   target="LNG Infra" 
                                   image="/assets/shock/shock-lng.png" 
                                   isStateActor={isStateActor}
                                   targetSelected={!!targetRegionId}
                                   onClick={() => handleInitiateOp('supply_shock')}
                                />
                                <ShockCard 
                                   name="Cyber-Meltdown" 
                                   target="Nuclear Grid" 
                                   image="/assets/shock/shock-nuclear.png" 
                                   isStateActor={isStateActor}
                                   targetSelected={!!targetRegionId}
                                   onClick={() => handleInitiateOp('cyber_meltdown')}
                                />
                              </div>
                          </div>

                          {/* TECH SHOCKS */}
                          <div className="space-y-4">
                              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase font-bold border-b border-zinc-800 pb-3">
                                <Cpu className="w-4 h-4 text-cyan-500" /> Technology sabotage
                              </div>
                              <div className="space-y-4">
                                <ShockCard 
                                   name="Proxy Insurgency" 
                                   target="Rare Earth" 
                                   image="/assets/shock/shock-rare-earth.png" 
                                   isStateActor={isStateActor}
                                   targetSelected={!!targetRegionId}
                                   onClick={() => handleInitiateOp('proxy_insurgency')}
                                />
                                <ShockCard 
                                   name="Espionage" 
                                   target="Semiconductor" 
                                   image="/assets/shock/shock-semicon.png" 
                                   isStateActor={isStateActor}
                                   targetSelected={!!targetRegionId}
                                   onClick={() => handleInitiateOp('espionage')}
                                />
                              </div>
                          </div>

                          {/* LOGISTICS SHOCKS */}
                          <div className="space-y-4">
                              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase font-bold border-b border-zinc-800 pb-3">
                                <Anchor className="w-4 h-4 text-zinc-400" /> Logistics interdiction
                              </div>
                              <div className="space-y-4">
                                <ShockCard 
                                   name="Naval Blockade" 
                                   target="Deepwater Ports" 
                                   image="/assets/shock/shock-port.png" 
                                   isStateActor={isStateActor}
                                   targetSelected={!!targetRegionId}
                                   onClick={() => handleInitiateOp('naval_blockade')}
                                />
                                <ShockCard 
                                   name="Border Skirmish" 
                                   target="Rail Network" 
                                   image="/assets/shock/shock-rail.png" 
                                   isStateActor={isStateActor}
                                   targetSelected={!!targetRegionId}
                                   onClick={() => handleInitiateOp('border_skirmish')}
                                />
                              </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* PERSISTENT TAB: BONDS */}
              <TabsContent value="bonds" className="h-full mt-0">
                <ScrollArea className="h-full">
                  <div className="space-y-8 pr-6 pb-12">
                    {!hasDiplomacy ? (
                      <div className="py-40 text-center space-y-6">
                        {userHomeRegionId !== null ? (
                            <div className="max-w-md mx-auto p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                              <p className="text-lg font-bold text-amber-500 font-mono uppercase tracking-widest">Passport Lock Active</p>
                              <p className="text-sm text-zinc-500 font-mono leading-relaxed">
                                You are already a registered citizen of **Region 00{userHomeRegionId}**. 
                                Hegemony protocols enforce a single-citizenship mandate.
                              </p>
                            </div>
                        ) : (
                            <>
                              <div className="space-y-2">
                                <p className="text-xs text-zinc-600 font-mono uppercase tracking-[0.3em]">Unregistered Entity</p>
                                <p className="text-zinc-400 text-sm max-w-xs mx-auto">Authorize your diplomatic presence in this region to begin staking bonds.</p>
                              </div>
                              <Button onClick={handleJoinFaction} disabled={issubmitting} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-14 px-10 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] group">
                                {issubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> Accept Regional Citizenship</>}
                              </Button>
                            </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="p-8 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 flex justify-between items-center">
                            <div className="space-y-1">
                              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Diplomatic Status</div>
                              <div className="text-xl font-black text-emerald-400 uppercase tracking-[0.1em]">Verified Citizen</div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Your Holdings</div>
                              <div className="text-2xl font-black text-cyan-400 font-mono">{regionBonds.toLocaleString()} $BOND</div>
                            </div>
                        </div>
                        
                        <div className="space-y-4 p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30">
                            <label className="text-xs font-mono text-zinc-500 uppercase font-bold tracking-widest">Stake $CAP for Yield Bonds</label>
                            <div className="flex gap-4">
                              <Input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(Number(e.target.value))} 
                                className="bg-black border-zinc-800 font-mono text-cyan-400 h-14 text-xl rounded-xl" 
                              />
                              <Button onClick={handleStake} disabled={issubmitting} className="bg-zinc-100 text-black hover:bg-white font-black h-14 px-10 rounded-xl tracking-widest">
                                {issubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "STAKE"}
                              </Button>
                            </div>
                            <p className="text-xs text-zinc-600 font-mono italic">Bonds represent your fractional ownership of regional resources. Yield is distributed automatically every turn.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="intel" className="h-full mt-0">
                <ScrollArea className="h-full">
                  <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 flex items-start gap-6">
                      <BarChart3 className="w-10 h-10 text-zinc-700 shrink-0" />
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Region 00{regionId} Intelligence Brief</h3>
                        <p className="text-sm text-zinc-500 font-mono leading-loose">
                          • **ENERGY**: Powers the grid. Higher levels increase base $CAP resource generation by 15% per level.
                          <br />
                          • **TECHNOLOGY**: Scientific dominance. Reduces infrastructure maintenance and increases Covert Op success probability.
                          <br />
                          • **LOGISTICS**: Geopolitical reach. Generates passive Diplomatic Influence used to veto rival resolutions.
                        </p>
                      </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UpgradeCard({ title, sector, image, disabled, cost }: any) {
   return (
      <div className={`relative group h-56 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${disabled ? "border-zinc-800 opacity-50" : "border-cyan-500/20 hover:border-cyan-400 cursor-pointer shadow-lg hover:shadow-cyan-500/20 scale-[1.02]"}`}>
         <Image src={image} alt={title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-colors" />
         <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <Badge className="text-[10px] bg-cyan-500 text-black font-bold border-none h-5 uppercase px-3 tracking-tighter">{sector}</Badge>
               <Construction className="w-6 h-6 text-cyan-500 drop-shadow-md" />
            </div>
            <div>
               <p className="text-sm font-bold text-white leading-tight uppercase drop-shadow-lg mb-1">{title}</p>
               <div className="flex justify-between items-end">
                  <p className="text-xs text-emerald-400 font-mono font-bold">{cost.toLocaleString()} $CAP</p>
                  <span className="text-[9px] text-zinc-500 font-mono uppercase group-hover:text-cyan-400 transition-colors">Construct</span>
               </div>
            </div>
         </div>
      </div>
   );
}

function ShockCard({ name, target, image, isStateActor, targetSelected, onClick }: any) {
   const isLocked = !isStateActor || !targetSelected;
   return (
      <div 
         onClick={!isLocked ? onClick : undefined}
         className={`relative group h-56 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${isLocked ? "border-zinc-800 cursor-not-allowed opacity-60" : "border-rose-900/40 hover:border-rose-500 cursor-pointer shadow-lg hover:shadow-rose-900/30"}`}
      >
         <Image src={image} alt={name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-colors" />
         <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <Badge variant="outline" className={`text-[10px] font-bold border-rose-900/50 text-rose-500 h-5 uppercase px-3 ${!isLocked && "bg-rose-500 text-black border-none"}`}>
                  {target}
               </Badge>
               <Skull className={`w-6 h-6 ${isLocked ? "text-zinc-600" : "text-rose-500 animate-pulse"}`} />
            </div>
            <div>
               <p className="text-sm font-bold text-zinc-100 leading-tight uppercase group-hover:text-rose-400 transition-colors drop-shadow-lg mb-2">{name}</p>
               {isLocked ? (
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">{!isStateActor ? "SOVEREIGN ONLY" : "SELECT TARGET"}</p>
               ) : (
                  <div className="flex items-center gap-3">
                     <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                     <p className="text-xs text-rose-300 font-bold font-mono uppercase tracking-widest">Execute Strike</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
