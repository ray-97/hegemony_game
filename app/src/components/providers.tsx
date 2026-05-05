"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { HegemonyProvider } from "@/lib/anchor/provider";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const endpoint = "http://localhost:8899";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "insert-your-privy-app-id-here"}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#06b6d4", // Cyan-500
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <HegemonyProvider>
              {children}
            </HegemonyProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </PrivyProvider>
  );
}
