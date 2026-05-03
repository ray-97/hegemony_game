# Hegemony: Development Log & Status Report

**Project Title:** Hegemony (Geopolitical Prediction Market Game)  
**Current Phase:** Phase 5 (Kinetic Events & State Shocks) Complete  
**Last Updated:** Wednesday, April 29, 2026

---

## [Phase 1] Project Scaffolding & Environment Setup
*Completed: Turn 1*

### Key Deliverables
1. **Modular Architecture:** 
   * Initialized with the `multiple` template for clean separation of concerns (`state`, `instructions`, `error`, `constants`).
2. **State Definitions:**
   * `GlobalState`: Tracks epoch timing, active status, and core protocol authorities.
   * `RegionAccount`: Tracks dominance (0-100), infrastructure levels (0-3), faction ownership, and resource yields.
3. **Environment Compatibility:** 
   * Resolved several "Edition 2024" dependency conflicts caused by the localized Solana toolchain (1.84.1) by pinning critical crates (`blake3`, `borsh`, `indexmap`, etc.) to compatible versions.

### Technical Verification
* **Build Status:** Verified successful program and IDL compilation (`anchor build`).
* **Sizing:** Implemented `INIT_SPACE` with explicit calculations for all `#[account]` structs to ensure deterministic space allocation.

---

## [Phase 2] Game Setup & Income Engine
*Completed: Turn 2*

### Key Deliverables
1. **Global Initialization:** 
   * Implemented `initialize_global_state` to set up the initial epoch, admin authority, and treasury vault.
2. **Regional Setup:** 
   * Implemented `initialize_region` to spawn strategic regions (e.g., North American Bloc) with unique resource yields and PDA seeds.
3. **Income Phase Logic:** 
   * **Turn Cycles:** Implemented a deterministic 24-hour turn-based system using Solana's `Clock`.
   * **Math Safety:** Yield calculated using **scaled integer math** to avoid floating-point issues: `yield = resource_yield * (1 + infrastructure_level) * (dominance / 100)`.
   * **Economic Payouts:** Integrated automated $CAP (Capital) token minting to regional owners via CPI to the SPL Token Program.
4. **Security & Constraints:** 
   * Turn advancement restricted to once every 24 hours.
   * Region-level idempotent income processing (cannot claim twice in the same turn).

### Technical Verification
* **Automated Tests:** 5 passing tests in `tests/hegemony.ts`.
* **Accuracy:** Verified regional owners receive exact expected token balance (e.g., 1,000 $CAP for 100% dominance).
* **Time-Lock:** Confirmed `advance_turn` correctly fails if called before the `TURN_DURATION` threshold.

---

## [Phase 3] Pre-Epoch Auction System
*Completed: Turn 3*

### Key Deliverables
1. **State Management:**
   * `RegionLeaderboard`: Tracks the current top bidder for each region and their total "Bid Weight" (Principal + Delegated).
   * `BidderEscrow`: Holds the $CAP tokens for each individual bidder to allow for delegation and potential refunds for losers.
   * `GameStatus`: Added a state machine (`PreEpoch`, `Active`, `Ended`) to `GlobalState` to enforce game phases.
2. **Auction Instructions:**
   * `initialize_leaderboard`: Sets up the competitive board for each region.
   * `submit_manifesto_bid`: Allows State Actor candidates to stake $CAP and publish their "Manifesto" (via URI).
   * `delegate_to_bidder`: Enables "Global Citizens" to back a candidate, increasing their total weight.
   * `resolve_auction`: Finalizes the winners, assigns region ownership, and transitions the game to the `Active` phase.
3. **Security & Logic:**
   * **Automated Promotion:** If a new bid or delegation pushes a candidate's weight above the current leader, the `RegionLeaderboard` is updated instantly ($O(1)$ resolution complexity).
   * **Phase Enforcement:** Instructions like `advance_turn` are now strictly locked until the auction is resolved and the game enters the `Active` phase.
   * **Scaled Bidding:** Integrates seamlessly with the $CAP token economic engine for seamless capital flow.

### Technical Verification
* **Automated Tests:** **6 passing tests** in `tests/hegemony.ts`.
* **Promotion Logic:** Verified that highest weight candidates correctly displace existing leaders in the leaderboard.
* **Capital Flow:** Confirmed tokens are successfully escrowed in the program vault during bidding and winners correctly trigger regional yields post-resolution.

---

## [Phase 4] Prediction Market AMM (The Trading Core)
*Completed: Turn 4*

### Key Deliverables
1. **Market State Management:**
   * `MarketAccount`: Tracks the prediction market pool logic and resolution state (`Unresolved`, `ResolvedYes`, `ResolvedNo`).
   * **Virtual AMM Pools:** Modeled `pool_yes` and `pool_no` virtually to save compute/storage, with pairs minted directly to users upon swap instead of holding static tokens.
2. **AMM Instructions:**
   * `initialize_market`: Creates a new binary prediction market, generating dedicated YES and NO mints and transferring initial capital ($CAP) liquidity to a secure market vault.
   * `trade_shares`: Allows players to execute buys, automatically utilizing the constant product invariant ($k = pool_{yes} \times pool_{no}$) to calculate the exact amount of YES or NO shares returned for their $CAP input.
   * `resolve_market`: Formally transitions a market to a resolved state.
   * `claim_payout`: Enables holders of the winning binary share to burn their tokens for a 1:1 $CAP payout from the vault.
3. **Security & Math Integrity:**
   * **Rounding Protection:** AMM rounding logic was strictly implemented to round in favor of the pool (`new_pool_yes` calculation) preventing the $k$ invariant from ever decreasing due to integer math truncation.
   * **Zero Floating-Point:** Fully `checked_math` dependent AMM implementation.
   * **Slippage Mechanics:** Effectively implements a dynamic bonding curve where heavy backing increases the price towards 1.00 $CAP.

### Technical Verification
* **Automated Tests:** Added 3 new test suites directly focused on AMM operations (9 passing tests total).
* **Curve Accuracy:** Verified user received exactly 19 YES shares after investing 10 $CAP into an initial 100-liquidity pool, confirming correct slippage behavior without breaking $k$.
* **Payout Solvency:** Verified that upon market resolution, the winning shares can be perfectly redeemed for $CAP and the underlying token accounts are burned.

---

## [Phase 5] Kinetic Events & State Shocks
*Completed: Turn 5*

### Key Deliverables
1. **Diplomatic Influence (DI) System:**
   * `DiplomaticInfluenceAccount`: Implemented a soulbound soft-power metric for State Actors.
   * `initialize_diplomacy`: Sets up the initial DI for regional leaders.
2. **Covert Operations:**
   * `initiate_covert_op`: Implemented high-risk executive actions.
   * **Hybrid Cost Logic:** Consumes DI based on target region's dominance ($cost = 10 \times D_r$) and transfers a flat $CAP fee to the market as "YES" liquidity injection, widening the profit margin for the attacker.
3. **State Displacement Logic:**
   * `resolve_kinetic_market`: Hooks the AMM resolution into the Map state.
   * **Infrastructure Degradation:** Successful events (Resolved YES) now automatically degrade the target region's infrastructure level.
   * **Volatility Penalty:** Applies a raw score penalty to the region, simulating post-sabotage instability.
4. **Security & Math:**
   * Strict phase enforcement (Operations only allowed during `Active` game status).
   * Safe `checked_math` for DI consumption and infrastructure shifts.

### Technical Verification
* **Automated Tests:** **11 passing tests** total in `tests/hegemony.ts`.
* **DI Integrity:** Verified successful initialization of soulbound DI.
* **Covert Op Verification:** Confirmed initiation with correct $CAP and DI transfers, and verified "YES" liquidity injection into the target market.
* **Map Impact:** Verified that kinetic resolution causes regional infrastructure level to drop and applies the volatility penalty.

---

## Future Implementations

### Phase 6: AI Agents & Settlement
* **Agent Logic:** Python backend for arbitrage between regional and macro markets.
* **Global Settlement:** Final distribution of protocol revenue and prize pools at the end of the Epoch.
