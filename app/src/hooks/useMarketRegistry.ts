"use client";

import { useState, useEffect } from "react";
import { useHegemony } from "@/lib/anchor/provider";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export interface MarketState {
  marketId: number;
  regionId: number;
  creator: string;
  thesisType: string;
  poolYes: number;
  poolNo: number;
  resolutionState: string;
  pda: PublicKey;
  yesMint: string;
  noMint: string;
  capitalVault: string;
}

export function useMarketRegistry(regionId: number | null) {
  const { program } = useHegemony();
  const [markets, setMarkets] = useState<MarketState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!program || regionId === null) return;

    const fetchMarkets = async () => {
      try {
        const allMarkets = await program.account.marketAccount.all([
          {
            memcmp: {
              offset: 8 + 8, // 8 bytes discriminator + 8 bytes market_id
              bytes: bs58.encode(Buffer.from([regionId])),
            }
          }
        ]);

        const formatted = allMarkets.map((m) => ({
          marketId: m.account.marketId.toNumber(),
          regionId: m.account.regionId,
          creator: m.account.creator.toBase58(),
          thesisType: Object.keys(m.account.thesisType)[0],
          poolYes: m.account.poolYes.toNumber() / 1e9,
          poolNo: m.account.poolNo.toNumber() / 1e9,
          resolutionState: Object.keys(m.account.resolutionState)[0],
          pda: m.publicKey,
          yesMint: m.account.yesMint.toBase58(),
          noMint: m.account.noMint.toBase58(),
          capitalVault: m.account.capitalVault.toBase58(),
        }));

        // HACK FOR DEMO: Inject Region 5 Market (Deepwater Port, Index 4)
        if (regionId === 5) {
           const isEnded = (window as any).DEMO_STATUS === "Ended";
           formatted.push({
              marketId: 504,
              regionId: 5,
              creator: "11111111111111111111111111111111",
              thesisType: "macro",
              poolYes: isEnded ? 1000 : 300, 
              poolNo: isEnded ? 0 : 700,
              resolutionState: isEnded ? "resolvedNo" : "unresolved",
              pda: PublicKey.default,
              yesMint: PublicKey.default.toBase58(),
              noMint: PublicKey.default.toBase58(),
              capitalVault: PublicKey.default.toBase58(),
           });
        }

        setMarkets(formatted);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching markets:", err);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000);
    return () => clearInterval(interval);
  }, [program, regionId]);

  return { markets, isLoading };
}
