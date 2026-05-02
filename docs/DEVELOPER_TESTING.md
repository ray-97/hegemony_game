# Hegemony: Developer Testing Guide

This guide outlines how to verify the core game mechanics of the Hegemony project on a local environment.

## 1. What is Functionally Testable?

| Feature | Logic to Verify |
| :--- | :--- |
| **Administrative Setup** | Initialization of `GlobalState` and `RegionAccounts` (7 strategic regions). |
| **PDA Derivation** | Seed-based isolation for regions (`["region", id]`) and global state. |
| **Economic Engine** | Yield calculation: `yield = resource_yield * (1 + infra) * (dominance / 100)`. |
| **Turn Enforcements** | Prevention of `advance_turn` before 24h (1s in test mode) and double income claims. |
| **CPI (Minting)** | Successful minting of "Capital" tokens via the SPL Token Program. |

---

## 2. Running Automated Tests

The project uses the Anchor test framework (TypeScript/Mocha).

### Prerequisites
- Solana CLI & Anchor CLI installed.
- A default keypair at `~/.config/solana/id.json`.

### Execution
Run all tests:
```bash
anchor test
```

*Note: In `programs/hegemony/src/constants.rs`, the `TURN_DURATION` is currently set to `5` second to allow the `Processes income cycle` test case to pass without waiting 24 hours.*

---

## 3. Manual Board Initialization (Admin CLI)

You can manually initialize a full game board (Global State + 7 Regions) using the provided admin script.

### Prerequisites
Ensure a local validator is NOT running (the script uses the Anchor provider environment, which usually expects a clean slate or an existing validator).

### Execution
```bash
# Start a local validator in one terminal
solana-test-validator

# Run the initialization script in another
npx ts-node scripts/admin_init.ts
```

---

## 4. Inspection via CLI

After running tests or the admin script, you can inspect the on-chain state:

### View Global State
```bash
anchor account global_state
```

### View a Specific Region
```bash
# Replace <REGION_ID> with 1-7
# Note: You need to find the PDA address first using the derivation seeds
solana account <REGION_PDA_ADDRESS>
```

### View Token Balances
```bash
solana token accounts
```
