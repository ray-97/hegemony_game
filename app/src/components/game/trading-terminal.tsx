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

interface TradingTerminalProps {
  regionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TradingTerminal({ regionId, isOpen, onClose }: TradingTerminalProps) {
  const [amount, setAmount] = useState(100);
  const [activeMarket, setActiveMarket] = useState<any>(null);
  const { program } = useHegemony();

  // In a real implementation, we would fetch the specific markets for this region
  // For the MVP UI, we'll simulate the price discovery
  const priceYes = 0.45;
  const priceNo = 0.55;
  const estimatedShares = Math.floor(amount / (activeMarket?.side === "YES" ? priceYes : priceNo));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 text-[10px]">PRO TERMINAL</Badge>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight uppercase">
            Regional Prediciton Market
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-mono text-xs">
            Region 00{regionId}: Pan-Asian Infrastructure Thesis
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="trade" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border-zinc-800">
            <TabsTrigger value="trade" className="text-xs uppercase font-bold">Trade Shares</TabsTrigger>
            <TabsTrigger value="intel" className="text-xs uppercase font-bold">Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-6 pt-4">
            {/* Market Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-emerald-500/20 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Support (YES)</span>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">${priceYes}</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-rose-500/20 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Oppose (NO)</span>
                  <TrendingDown className="w-3 h-3 text-rose-500" />
                </div>
                <div className="text-2xl font-bold text-rose-400">${priceNo}</div>
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>Deployment Capital ($CAP)</span>
                <span className="text-zinc-500">Bal: 12,450</span>
              </div>
              <div className="flex gap-4 items-center">
                <Input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="bg-zinc-900 border-zinc-800 font-mono text-cyan-400"
                />
                <div className="flex gap-1">
                  {[25, 50, 100].map(p => (
                    <Button key={p} variant="outline" size="xs" className="text-[10px] border-zinc-800 text-zinc-500" onClick={() => setAmount(p * 10)}>{p}%</Button>
                  ))}
                </div>
              </div>
              <Slider 
                value={[amount]} 
                onValueChange={([v]) => setAmount(v)} 
                max={1000} 
                step={10} 
                className="py-4"
              />
            </div>

            {/* Execution Details */}
            <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800 space-y-2 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase">Est. Returns</span>
                <span className="text-zinc-300">{(amount * 2.2).toFixed(2)} $CAP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase">Slippage Tolerance</span>
                <span className="text-zinc-300">0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase">AMM Protocol Fee</span>
                <span className="text-emerald-500">0.00 (Makers Rebate)</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="intel" className="pt-4 space-y-4">
             <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-cyan-400 uppercase">AI Agency Context</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    This market reflects the probability of the "Pan-Asian High Speed Rail" reaching Level 2 completion. 
                    Net confidence (MCI) is currently trending negative due to energy shortages in Sector 01.
                  </p>
                </div>
             </div>
             <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase">Volatility Risk</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    A "Grid Sabotage" thesis was recently proposed. If resolved YES, your infrastructure bonds in this region will be significantly degraded.
                  </p>
                </div>
             </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs h-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            Deploy Capital (YES)
          </Button>
          <Button variant="outline" className="flex-1 border-rose-900/50 hover:bg-rose-500/10 text-rose-500 font-bold uppercase tracking-widest text-xs h-10">
            Short Market (NO)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
