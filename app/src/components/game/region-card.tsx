import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Cpu, Ship } from "lucide-react";
import Image from "next/image";

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

const REGION_IMAGES: Record<number, string> = {
  1: "/assets/face/face-pan-asian.png",
  2: "/assets/face/face-american-federation.png",
  3: "/assets/face/face-eurozone.png",
  4: "/assets/face/face-gulf.png",
  5: "/assets/face/face-global-south.png",
};

export function RegionCard({ id, name, dominance, energy, tech, logistics, status, onClick }: RegionProps) {
  const imageUrl = REGION_IMAGES[id] || "/assets/face/face-american-federation.png";

  return (
    <Card 
      className="bg-zinc-950 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group overflow-hidden relative"
      onClick={onClick}
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-32 overflow-hidden opacity-40 group-hover:opacity-60 transition-opacity">
        <Image 
          src={imageUrl} 
          alt={name}
          width={400}
          height={160}
          className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      <CardHeader className="relative pt-24 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-zinc-100 text-lg group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
              {name}
            </CardTitle>
            <CardDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
              Strategic Sector 00{id}
            </CardDescription>
          </div>
          <Badge variant={status === "Stable" ? "outline" : "destructive"} className="font-mono text-[9px] uppercase border-zinc-700 h-5 px-1.5">
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* Dominance Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
            <span>Dominance Radius</span>
            <span className={dominance > 50 ? "text-cyan-400" : "text-zinc-500"}>{dominance}%</span>
          </div>
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-1000" 
              style={{ width: `${dominance}%` }}
            />
          </div>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-3 gap-2">
          <SectorIcon icon={<Zap className="w-3 h-3" />} label="Energy" level={energy} />
          <SectorIcon icon={<Cpu className="w-3 h-3" />} label="Tech" level={tech} />
          <SectorIcon icon={<Ship className="w-3 h-3" />} label="Logs" level={logistics} />
        </div>
      </CardContent>
    </Card>
  );
}

function SectorIcon({ icon, label, level }: { icon: React.ReactNode; label: string; level: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-1.5 rounded bg-zinc-900/30 border border-zinc-800/50">
      <div className="text-zinc-500 group-hover:text-cyan-500/70 transition-colors">{icon}</div>
      <span className="text-[7px] font-bold font-mono text-zinc-600 uppercase tracking-tighter">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-0.5 rounded-full ${
              i <= level ? "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
