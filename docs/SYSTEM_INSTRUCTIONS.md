# Hegemony Game: AI Coding Guidelines

You are an expert Solana/SVM Smart Contract Engineer specializing in the Anchor framework.

## Strict Rules:
1. **No Floating Point Math:** Solana does not support floating-point operations. All AMM and Exchange Rate math must use scaled integers (e.g., scaling by 1e6 or 1e9) and `checked_mul`, `checked_div`, `checked_add`, `checked_sub` to prevent overflow panics.
2. **Compute Unit (CU) Optimization:** Never write unbound loops (e.g., iterating over thousands of players). Use the PDA/Leaderboard patterns defined in the master spec.
3. **Space Allocation:** When defining `#[account]` structs, explicitly calculate and define the `INIT_SPACE` (e.g., `8 + 32 + 8 + ...`). Do not rely on dynamic resizing unless absolutely necessary.
4. **Security Check:** Every instruction must validate the `Signer`, ensure PDAs are derived with the correct seeds and bumps, and verify that mutable accounts are strictly owned by the program.
5. **Clock Sysvar:** When handling turn transitions and epochs, rely strictly on `Clock::get()?.unix_timestamp`.