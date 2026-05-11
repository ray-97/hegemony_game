"use client";

import { useState, useEffect, useMemo } from "react";
import { RegionCard } from "@/components/game/region-card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Globe, Shield, Activity, Users, Wallet, Coins, UserCircle2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { useWorldState } from "@/hooks/useWorldState";
import { useUserBalances } from "@/hooks/useUserBalances";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { TradingTerminal } from "@/components/game/trading-terminal";
import { TreasuryModal } from "@/components/game/treasury-modal";

export default function GameDashboard() {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey } = useWallet();
  const liveState = useWorldState();
  const userBalances = useUserBalances();
  const { name: playerAlias } = usePlayerProfile();
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [isTreasuryOpen, setIsTreasuryOpen] = useState(false);

  const [alerts, setAlerts] = useState<{id: number, type: string, text: string}[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Fetch live intelligence reports
    const fetchIntel = async () => {
      try {
        const res = await fetch('/data/intelligence.json');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error("Failed to fetch intelligence:", err);
      }
    };

    fetchIntel();
    const interval = setInterval(fetchIntel, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black font-mono text-cyan-500">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 animate-pulse" />
          <span className="text-xs uppercase tracking-[0.3em] animate-pulse">Booting Hegemony Terminal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation / Status Bar */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            <h1 className="text-xl font-bold tracking-tighter text-zinc-100 uppercase">Hegemony</h1>
          </div>
          <div className="h-4 w-px bg-zinc-800 mx-2" />
          <div className="flex gap-4 font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-zinc-500 uppercase text-[10px]">Epoch</span>
              <span className="text-cyan-400">{liveState.isLoading ? "---" : `00${liveState.epoch}`}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 uppercase text-[10px]">Turn</span>
              <span className="text-cyan-400">{liveState.isLoading ? "--/--" : `${liveState.turn}/30`}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 uppercase text-[10px]">Status</span>
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-[10px] py-0 h-4 uppercase">
                {liveState.isLoading ? "Loading" : liveState.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 font-mono text-[10px] items-center text-zinc-500 uppercase">
             {connected && (
               <>
                 <div className="flex flex-col items-end">
                   <span className="text-[9px] text-zinc-600">Identity</span>
                   <span className="text-cyan-400 font-bold tracking-widest flex items-center gap-1">
                     <UserCircle2 className="w-3 h-3" /> {playerAlias || "Anonymous"}
                   </span>
                 </div>
                 <div className="h-4 w-px bg-zinc-800" />
                 <div className="flex flex-col items-end">
                   <span className="text-[9px] text-zinc-600">Arcade Capital</span>
                   <span className="text-emerald-400 font-bold tracking-widest">
                     {userBalances.isLoading ? "..." : userBalances.capital.toLocaleString()} $CAP
                   </span>
                 </div>
                 <div className="h-4 w-px bg-zinc-800" />
               </>
             )}

             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setIsTreasuryOpen(true)}
               className="h-7 border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-[10px]"
             >
               <Coins className="w-3 h-3 mr-1.5" /> Fund Terminal
             </Button>
             <div className="flex items-center gap-1.5">
               <Activity className={`w-3 h-3 ${liveState.isLoading ? "text-zinc-600" : "text-green-500"}`} /> 
               {liveState.isLoading ? "Syncing..." : "System Online"}
             </div>
             <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> 1,248 Citizens</div>
          </div>
          <WalletMultiButton className="!bg-zinc-100 !text-black !font-mono !text-[10px] !uppercase !h-8 !px-4 !rounded-md hover:!bg-white" />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Strategic Intel */}
        <aside className="w-80 border-r border-zinc-800 bg-zinc-950/30 backdrop-blur-sm p-6 hidden lg:block overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            <div>
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Global Intelligence
              </h2>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2 group hover:border-zinc-700 transition-colors">
                    <div className="flex justify-between">
                      <span className={`text-[9px] font-bold uppercase ${alert.type === 'Strategic' ? 'text-cyan-500' : 'text-amber-500'}`}>{alert.type}</span>
                      <span className="text-[8px] text-zinc-600">JUST NOW</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed">{alert.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/10">
              <h3 className="text-xs font-bold text-cyan-400 uppercase mb-2">Neural Link Active</h3>
              <p className="text-[10px] text-zinc-500 font-mono italic">Turn 12 Consensus: High probability of Eurozone energy shock. Position accordingly.</p>
            </div>
          </div>
        </aside>

        {/* Main View: Regional Board */}
        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase">Geopolitical Board</h2>
                <p className="text-sm text-zinc-500 font-mono">Select a region to initiate tactical operations.</p>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-zinc-900 rounded border border-zinc-800 animate-pulse" />
                <div className="h-10 w-32 bg-zinc-900 rounded border border-zinc-800 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {liveState.isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-zinc-900/20 border border-zinc-800 animate-pulse" />
                ))
              ) : (
                liveState.regions.map((region) => (
                  <RegionCard 
                    key={region.id} 
                    {...region}
                    onClick={() => setSelectedRegionId(region.id)}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Overlays */}
      {selectedRegionId && (
        <TradingTerminal 
          regionId={selectedRegionId} 
          isOpen={!!selectedRegionId} 
          onClose={() => setSelectedRegionId(null)}
        />
      )}

      <TreasuryModal 
        isOpen={isTreasuryOpen}
        onClose={() => setIsTreasuryOpen(false)}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
