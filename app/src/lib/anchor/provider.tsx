"use client";

import { createContext, useContext, useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react"; // We might switch this to Privy's useWallets later
import idl from "./hegemony.json";
import { Hegemony } from "./hegemony";

const PROGRAM_ID = new PublicKey("79yvXQvVyqMYy4ofqKQD1CZXQSyH5eJ7dHT6ZZuXg7ND");

interface HegemonyContextType {
  program: Program<Hegemony> | null;
  connection: Connection;
}

const HegemonyContext = createContext<HegemonyContextType | undefined>(undefined);

export function HegemonyProvider({ children }: { children: React.ReactNode }) {
  // For local development, use localhost
  const connection = useMemo(() => new Connection("http://localhost:8899", "confirmed"), []);
  
  // Placeholder wallet for now - we will hook this into Privy
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey) return null;
    
    const provider = new AnchorProvider(connection, wallet as any, {
      preflightCommitment: "confirmed",
    });
    
    return new Program(idl as any as Hegemony, PROGRAM_ID, provider);
  }, [connection, wallet]);

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
