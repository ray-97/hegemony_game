"use client";

import { useState, useEffect } from "react";
import { useHegemony } from "@/lib/anchor/provider";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export function usePlayerProfile() {
  const { program } = useHegemony();
  const { publicKey } = useWallet();
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    if (!program || !publicKey) return;
    try {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_profile"), publicKey.toBuffer()],
        program.programId
      );
      const profile = await program.account.playerProfile.fetch(profilePda);
      setName(profile.name);
    } catch (err) {
      setName(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [program, publicKey]);

  const updateName = async (newName: string) => {
    if (!program || !publicKey) return;
    try {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_profile"), publicKey.toBuffer()],
        program.programId
      );
      await program.methods
        .initializePlayerProfile(newName)
        .accounts({
          profile: profilePda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
      setName(newName);
      await fetchProfile(); // Refresh after update
    } catch (err) {
      console.error("Failed to update name:", err);
    }
  };

  return { name, isLoading, updateName, refresh: fetchProfile };
}
