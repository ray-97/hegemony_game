# Hegemony Project Instructions

## Architectural Standards
- **Blockchain:** Solana (Anchor 0.31 Program, Anchor 0.32 Frontend).
- **Frontend:** Next.js (TypeScript) + TailwindCSS + Lucide Icons.
- **State Management:** Custom React hooks for polling on-chain accounts.

## Core Mechanics
- **Asymmetric Regions (5):**
  1. Pan-Asian Alliance (Region 1)
  2. North American Federation (Region 2)
  3. Eurozone Bloc (Region 3)
  4. Gulf-MENA Kingdom (Region 4)
  5. Global South Coalition (Region 5)
- **Currency:** Arcade Capital ($CAP). 1 SOL = 1,000 $CAP via Treasury `deposit_sol`.
- **Citizenship:** Single passport enforced via PDA seeds `[b"diplomacy", authority]`. Staking $CAP yields Regional Bonds ($BOND).
- **Phases:** Transitions from `PreEpoch` (Auction) to `Active` (Live Markets).

## Technical Conventions
- **IDL Normalization:** `app/src/lib/anchor/provider.tsx` uses a deep-clone normalization layer to convert Anchor 0.31 snake_case names/args to camelCase for 0.32 compatibility.
- **Market Discovery:** `market_id` suffix logic (e.g., `baseId + eventIndex`) is used to map on-chain accounts to strategic titles (0-5 Upgrades, 6-11 Shocks).
- **Global Search:** Use `bs58` encoding for RPC memcmp filters (Base64 is NOT supported by the local validator for these params).

## Administrative
- **Dev Whitelist:** `EeHZdUYngn8tooohV3GiZ5gaeKTTX1hjs37GsuuYgafP` has persistent State Actor privileges across all regions.
