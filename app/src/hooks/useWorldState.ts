"use client";

import { useState, useEffect, useMemo } from "react";
import { useHegemony } from "@/lib/anchor/provider";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export interface RegionState {
  id: number;
  name: string;
  dominance: number;
  energy: number;
  tech: number;
  logistics: number;
  status: string;
}

export interface WorldState {
  epoch: number;
  turn: number;
  status: string;
  regions: RegionState[];
  isLoading: boolean;
}

const REGION_NAMES: Record<number, string> = {
  1: "Pan-Asian Alliance",
  2: "North American Federation",
  3: "Eurozone Bloc",
  4: "Gulf-MENA Kingdom",
  5: "Global South Coalition",
};

export function useWorldState() {
  const { program } = useHegemony();
  const [state, setState] = useState<WorldState>({
    epoch: 0,
    turn: 0,
    status: "Loading",
    regions: [],
    isLoading: true,
  });

  useEffect(() => {
    if (!program) return;

    const fetchData = async () => {
      try {
        // 1. Fetch Global State
        const [globalStatePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("global_state")],
          program.programId
        );
        const globalState = await program.account.globalState.fetch(globalStatePda);

        // 2. Fetch All Regions
        const regionAccounts = await program.account.regionAccount.all();
        
        const regions: RegionState[] = regionAccounts.map((account) => {
          const data = account.account;
          return {
            id: data.id,
            name: REGION_NAMES[data.id] || `Region ${data.id}`,
            dominance: data.dominance,
            energy: data.energyLevel,
            tech: data.techLevel,
            logistics: data.logisticsLevel,
            status: Object.keys(data.status)[0].charAt(0).toUpperCase() + Object.keys(data.status)[0].slice(1),
          };
        }).sort((a, b) => a.id - b.id);

        setState({
          epoch: globalState.epoch.toNumber(),
          turn: globalState.turn,
          status: Object.keys(globalState.status)[0].charAt(0).toUpperCase() + Object.keys(globalState.status)[0].slice(1),
          regions,
          isLoading: false,
        });
      } catch (err) {
        console.error("Error fetching world state:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [program]);

  return state;
}
