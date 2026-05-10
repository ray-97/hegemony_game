"use client";

import { useState, useEffect } from "react";
import { useHegemony } from "@/lib/anchor/provider";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export interface UserBalances {
  capital: number;
  bonds: Record<number, number>; // region_id -> amount
  isLoading: boolean;
}

export function useUserBalances() {
  const { program, connection } = useHegemony();
  const { publicKey } = useWallet();
  const [balances, setBalances] = useState<UserBalances>({
    capital: 0,
    bonds: {},
    isLoading: true,
  });

  useEffect(() => {
    if (!program || !publicKey) {
        setBalances(prev => ({ ...prev, isLoading: false }));
        return;
    }

    const fetchBalances = async () => {
      try {
        // 1. Get Capital Balance
        const [globalStatePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("global_state")],
          program.programId
        );
        const globalState = await program.account.globalState.fetch(globalStatePda);
        const capitalMint = globalState.capitalMint;
        
        const capitalAta = getAssociatedTokenAddressSync(capitalMint, publicKey);
        let capitalBalance = 0;
        try {
          const bal = await connection.getTokenAccountBalance(capitalAta);
          capitalBalance = bal.value.uiAmount || 0;
        } catch (e) {
          // ATA likely doesn't exist yet
        }

        // 2. Get All Region Bond Balances
        const regionAccounts = await program.account.regionAccount.all();
        const bonds: Record<number, number> = {};

        for (const reg of regionAccounts) {
          const bondMint = reg.account.bondMint;
          const bondAta = getAssociatedTokenAddressSync(bondMint, publicKey);
          try {
            const bal = await connection.getTokenAccountBalance(bondAta);
            bonds[reg.account.id] = bal.value.uiAmount || 0;
          } catch (e) {
            bonds[reg.account.id] = 0;
          }
        }

        setBalances({
          capital: capitalBalance,
          bonds,
          isLoading: false,
        });
      } catch (err) {
        console.error("Error fetching user balances:", err);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [program, publicKey, connection]);

  return balances;
}
