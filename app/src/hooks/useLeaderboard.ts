"use client";

import { useState, useEffect } from "react";
import { useHegemony } from "@/lib/anchor/provider";
import { PublicKey } from "@solana/web3.js";

export interface LeaderboardState {
  regionId: number;
  currentLeader: string;
  leaderName?: string;
  manifestoUri: string;
  totalBidWeight: number;
  isLoading: boolean;
}

export function useLeaderboard(regionId: number | null) {
  const { program } = useHegemony();
  const [leaderboard, setLeaderboard] = useState<LeaderboardState | null>(null);

  useEffect(() => {
    if (!program || regionId === null) return;

    const fetchLeaderboard = async () => {
      try {
        const [leaderboardPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("leaderboard"), Buffer.from([regionId])],
          program.programId
        );

        const data = await program.account.regionLeaderboard.fetch(leaderboardPda);
        
        let leaderName = undefined;
        if (data.currentLeader.toBase58() !== "11111111111111111111111111111111") {
           try {
              const [profilePda] = PublicKey.findProgramAddressSync(
                 [Buffer.from("player_profile"), data.currentLeader.toBuffer()],
                 program.programId
              );
              const profile = await program.account.playerProfile.fetch(profilePda);
              leaderName = profile.name;
           } catch {
              // No profile found
           }
        }

        setLeaderboard({
          regionId: data.regionId,
          currentLeader: data.currentLeader.toBase58(),
          leaderName: leaderName,
          manifestoUri: data.leaderManifestoUri,
          totalBidWeight: data.totalBidWeight.toNumber() / 1e9,
          isLoading: false,
        });
      } catch (err) {
        setLeaderboard({
          regionId: regionId,
          currentLeader: "None",
          manifestoUri: "",
          totalBidWeight: 0,
          isLoading: false,
        });
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [program, regionId]);

  return leaderboard;
}
