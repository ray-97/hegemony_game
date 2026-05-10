"use client";

import { useState, useEffect } from "react";
import { useHegemony } from "@/lib/anchor/provider";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync, unpackAccount } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export interface MarketPosition {
  marketId: number;
  yesBalance: number;
  noBalance: number;
}

export function useMarketPositions(markets: any[]) {
  const { program, connection } = useHegemony();
  const { publicKey } = useWallet();
  const [positions, setPositions] = useState<Record<number, MarketPosition>>({});

  useEffect(() => {
    if (!program || !publicKey || !markets || markets.length === 0) return;

    const fetchPositions = async () => {
      const newPositions: Record<number, MarketPosition> = {};

      for (const m of markets) {
        try {
          const yesMintStr = m.yesMint || m.account?.yesMint?.toBase58();
          const noMintStr = m.noMint || m.account?.noMint?.toBase58();

          if (!yesMintStr || !noMintStr) continue;

          const yesMint = new PublicKey(yesMintStr);
          const noMint = new PublicKey(noMintStr);

          const yesAta = getAssociatedTokenAddressSync(yesMint, publicKey);
          const noAta = getAssociatedTokenAddressSync(noMint, publicKey);

          let yesBal = 0;
          let noBal = 0;

          try {
            const yesAcc = await connection.getAccountInfo(yesAta);
            if (yesAcc) {
               const decoded = unpackAccount(yesAta, yesAcc);
               yesBal = Number(decoded.amount) / 1e9;
            }
          } catch {}

          try {
            const noAcc = await connection.getAccountInfo(noAta);
            if (noAcc) {
               const decoded = unpackAccount(noAta, noAcc);
               noBal = Number(decoded.amount) / 1e9;
            }
          } catch {}

          newPositions[m.marketId] = {
            marketId: m.marketId,
            yesBalance: yesBal,
            noBalance: noBal,
          };
        } catch (err) {
          console.error("Error fetching position for market", m.marketId, err);
        }
      }

      setPositions(newPositions);
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 10000);
    return () => clearInterval(interval);
  }, [program, publicKey, markets, connection]);

  return positions;
}
