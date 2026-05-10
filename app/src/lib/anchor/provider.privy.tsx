"use client";

import { createContext, useContext, useMemo } from "react";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import idl from "./hegemony.json";
import { Hegemony } from "./hegemony";

const PROGRAM_ID = new PublicKey("DqPFvuxkEdZJ4ZcDV5ufiPG9rG9k7WSy8zsidrewo7JX");

interface HegemonyContextType {
  program: Program<Hegemony> | null;
  connection: Connection;
}

const HegemonyContext = createContext<HegemonyContextType | undefined>(undefined);

export function HegemonyProvider({ children }: { children: React.ReactNode }) {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  // Find the primary Solana wallet from Privy
  const primarySolanaWallet = useMemo(() => {
    return wallets.find((w) => w.walletClientType === "privy" || w.connectorType === "solana");
  }, [wallets]);

  const connection = useMemo(() => new Connection("http://localhost:8899", "confirmed"), []);
  
  const program = useMemo(() => {
    try {
      // Determine the active wallet for Anchor
      let activeWallet: any;

      if (authenticated && primarySolanaWallet) {
        activeWallet = {
          publicKey: new PublicKey(primarySolanaWallet.address),
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            // Bridge Privy's signing to Anchor
            // Note: In a real app, we might use primarySolanaWallet.getProvider()
            // but for Anchor we just need the address and the signing capability
            return tx; // Simplified for read/write scaffolding
          },
          signAllTransactions: async (txs: (Transaction | VersionedTransaction)[]) => txs,
        };
      } else {
        // Read-only fallback
        activeWallet = {
          publicKey: PublicKey.default,
          signTransaction: async (tx: any) => tx,
          signAllTransactions: async (txs: any) => txs,
        };
      }

      const provider = new AnchorProvider(connection, activeWallet, {
        preflightCommitment: "confirmed",
        commitment: "confirmed",
      });
      
      let idlData = (idl as any).default || idl;
      const patchedIdl = JSON.parse(JSON.stringify(idlData));
      
      if (patchedIdl.metadata) patchedIdl.metadata.spec = "0.2.0";

      if (patchedIdl.accounts) {
        patchedIdl.accounts = patchedIdl.accounts.map((acc: any) => ({
          ...acc,
          name: acc.name.charAt(0).toLowerCase() + acc.name.slice(1),
          type: acc.type || acc.name,
        }));
      }

      return new Program(patchedIdl as any, provider);
    } catch (err) {
      console.error("Failed to initialize Anchor Program:", err);
      return null;
    }
  }, [connection, authenticated, primarySolanaWallet?.address]);

  return (
    <HegemonyContext.Provider value={{ program, connection }}>
      {children}
    </HegemonyContext.Provider>
  );
}

export const useHegemony = () => {
  const context = useContext(HegemonyContext);
  if (context === undefined) {
    throw new Error("useHegemony must be used within a HegemonyProvider");
  }
  return context;
};
