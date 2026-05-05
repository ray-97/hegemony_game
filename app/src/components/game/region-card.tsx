import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Cpu, Ship } from "lucide-react";

interface RegionProps {
  id: number;
  name: string;
  dominance: number;
  energy: number;
  tech: number;
  logistics: number;
  status: string;
  onClick?: () => void;
}

export function RegionCard({ id, name, dominance, energy, tech, logistics, status, onClick }: RegionProps) {
  return (
    <Card 
      className="bg-black/40 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-zinc-100 group-hover:text-cyan-400 transition-colors">
              {name}
            </CardTitle>
            <CardDescription className="text-zinc-500 font-mono text-xs">
              ID: 00{id}
            </CardDescription>
          </div>
          <Badge variant={status === "Stable" ? "outline" : "destructive"} className="font-mono text-[10px] uppercase">
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dominance Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
            <span>Dominance</span>
            <span className={dominance > 50 ? "text-cyan-400" : "text-zinc-500"}>{dominance}%</span>
          </div>
          <Progress value={dominance} className="h-1 bg-zinc-900" />
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <SectorIcon icon={<Zap className="w-3 h-3" />} label="NRG" level={energy} />
          <SectorIcon icon={<Cpu className="w-3 h-3" />} label="TCH" level={tech} />
          <SectorIcon icon={<Ship className="w-3 h-3" />} label="LOG" level={logistics} />
        </div>
      </CardContent>
    </Card>
  );
}

function SectorIcon({ icon, label, level }: { icon: React.ReactNode; label: string; level: number }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded bg-zinc-900/50 border border-zinc-800/50">
      <div className="text-zinc-500">{icon}</div>
      <span className="text-[9px] font-mono text-zinc-500 uppercase">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1 rounded-full ${
              i <= level ? "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
