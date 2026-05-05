"use client";

import { useState, useEffect } from "react";
import { RegionCard } from "@/components/game/region-card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Globe, Shield, Activity, Users, Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { useWorldState } from "@/hooks/useWorldState";
import { TradingTerminal } from "@/components/game/trading-terminal";

export default function GameDashboard() {
  const { login, logout, authenticated, user } = usePrivy();
  const liveState = useWorldState();
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  
  // Mock alerts for now (can be hooked to intelligence_agency.py later)
  const alerts = [
    { id: 1, type: "Strategic", text: "Global transition to Active phase complete. Regional yields are now liquid." },
    { id: 2, type: "Market", text: "Predictive algorithms suggest high volatility in Pan-Asian tech markets." },
  ];

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
          <div className="hidden md:flex gap-4 font-mono text-[10px] items-center text-zinc-500 uppercase">
             <div className="flex items-center gap-1.5">
               <Activity className={`w-3 h-3 ${liveState.isLoading ? "text-zinc-600" : "text-green-500"}`} /> 
               {liveState.isLoading ? "Syncing..." : "System Online"}
             </div>
             <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> 1,248 Citizens</div>
          </div>
          <Button 
            onClick={authenticated ? logout : login}
            variant="outline" 
            className="border-zinc-800 bg-black hover:bg-zinc-900 text-zinc-300 font-mono text-xs h-9"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {authenticated ? `${user?.wallet?.address?.slice(0, 4)}...${user?.wallet?.address?.slice(-4)}` : "Connect Terminal"}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Intelligence Agency Feed */}
        <aside className="w-80 border-r border-zinc-800 bg-zinc-950/20 flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Intelligence Agency</span>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {alerts.map((alert) => (
                <div key={alert.id} className="space-y-2 group">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{alert.type} Report</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono leading-relaxed border-l border-zinc-800 pl-3 group-hover:border-cyan-500/50 transition-colors">
                    {alert.text}
                  </p>
                </div>
              ))}
              <div className="pt-4 opacity-30 pointer-events-none italic text-[10px] text-zinc-500 text-center">
                Waiting for incoming signal...
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Center: Region Dashboard */}
        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_50%_50%,rgba(9,9,11,1)_0%,rgba(0,0,0,1)_100%)]">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Regional Command Center</h2>
                <p className="text-zinc-500 text-sm font-mono">Select a region to deploy capital or initiate covert operations.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-100">
                  <Globe className="w-4 h-4 mr-2" /> Global View
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {liveState.regions.map((region) => (
                <RegionCard
                  key={region.id}
                  id={region.id}
                  name={region.name}
                  dominance={region.dominance}
                  energy={region.energy}
                  tech={region.tech}
                  logistics={region.logistics}
                  status={region.status}
                  onClick={() => setSelectedRegionId(region.id)}
                />
              ))}
              
              {!liveState.isLoading && liveState.regions.length === 0 && (
                <div className="col-span-full py-20 text-center text-zinc-600 font-mono text-sm border border-dashed border-zinc-800 rounded-xl">
                  NO REGIONS DETECTED. INITIALIZE PROTOCOL VIA ADMIN TERMINAL.
                </div>
              )}

              {liveState.isLoading && [1,2,3].map(i => (
                <div key={i} className="h-[180px] bg-zinc-900/20 border border-zinc-800 animate-pulse rounded-xl" />
              ))}

              {/* Add Region Placeholder */}
              {!liveState.isLoading && liveState.regions.length < 7 && (
                <div className="border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center p-8 opacity-50 hover:opacity-100 transition-opacity cursor-pointer min-h-[200px]">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <Globe className="w-5 h-5 text-zinc-500" />
                  </div>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Uncharted Territory</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <TradingTerminal 
        regionId={selectedRegionId} 
        isOpen={selectedRegionId !== null} 
        onClose={() => setSelectedRegionId(null)} 
      />

      {/* Footer / Terminal Ticker */}
      <footer className="h-8 border-t border-zinc-800 bg-zinc-950 flex items-center px-6 overflow-hidden">
        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex gap-2 items-center text-[10px] font-mono">
              <span className="text-zinc-500 uppercase">Market 00{i}:</span>
              <span className="text-green-400">YES $0.48</span>
              <span className="text-red-400">NO $0.52</span>
              <span className="text-zinc-700">|</span>
            </div>
          ))}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
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
