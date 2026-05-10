"use client";

import { createContext, useContext, useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "./hegemony.json";
import { Hegemony } from "./hegemony";

const PROGRAM_ID = new PublicKey("DqPFvuxkEdZJ4ZcDV5ufiPG9rG9k7WSy8zsidrewo7JX");

interface HegemonyContextType {
  program: Program<Hegemony> | null;
  connection: Connection;
}

const HegemonyContext = createContext<HegemonyContextType | undefined>(undefined);

export function HegemonyProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const connection = useMemo(() => new Connection("http://localhost:8899", "confirmed"), []);
  
  const program = useMemo(() => {
    try {
      // Determine the active wallet for Anchor
      let activeWallet: any;

      if (wallet.publicKey) {
        activeWallet = wallet;
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

      if (patchedIdl.instructions) {
        patchedIdl.instructions = patchedIdl.instructions.map((ix: any) => {
          const newName = ix.name.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase());
          console.log(`[IDL Patch] ${ix.name} -> ${newName}`);
          return {
            ...ix,
            name: newName,
            // Normalize argument names
            args: ix.args?.map((arg: any) => ({
              ...arg,
              name: arg.name.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase()),
            })) || [],
            // Map accounts
            accounts: ix.accounts?.map((acc: any) => ({
              ...acc,
              name: acc.name.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase()),
            })) || [],
          };
        });
      }

      return new Program(patchedIdl as any, provider);
    } catch (err) {
      console.error("Failed to initialize Anchor Program:", err);
      return null;
    }
  }, [connection, wallet.publicKey]);

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
