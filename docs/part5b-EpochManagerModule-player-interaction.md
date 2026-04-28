### **6. EpochManagerModule: Player Interaction Flow**

The `EpochManagerModule` governs the lifecycle of the game. While the progression of time is handled by the Keeper/Crank system, players must directly interact with this module to enter the game, secure leadership roles, and claim their final payouts.

#### **Phase 1: Pre-Epoch (The Auction & Delegation)**
Before Turn 1 begins, the network must determine who gets to play as the 5-7 "State Actors" who control the regions, and who remains a "Trader."

* **Instruction: `submit_state_actor_bid`**
    * **Caller:** Any user wallet with a `PlayerAccount`.
    * **Parameters:** * `bid_amount` (u64): The amount of Capital tokens the player is locking up.
        * `manifesto_hash` (String): An IPFS/Arweave hash pointing to their "Manifesto" (their stated geopolitical strategy to attract Traders).
    * **Logic:** Locks the Capital in an escrow vault. The top 5-7 highest bidders (including delegated capital) at the end of the countdown are granted the `role: StateActor` and assigned a `RegionAccount`. 

* **Instruction: `delegate_capital`**
    * **Caller:** Users who want to play as `Traders` rather than State Actors.
    * **Parameters:**
        * `target_state_actor_pubkey` (Pubkey): The wallet of the aspiring State Actor they are voting for.
        * `amount` (u64): The amount of Capital to delegate.
    * **Logic:** Adds the Trader's Capital to the State Actor's total bid weight. If the State Actor wins a seat, the Trader's Capital is locked in that State Actor's treasury, and the Trader earns a percentage of that Region's infrastructure yield.

#### **Phase 2: Active Epoch (The Crank Failsafe)**
During the active game (Turns 1-30), players mostly interact with the `AMM_TradingModule` to buy/sell shares. However, they need a way to interact with the Epoch Manager if the Off-Chain AI Keeper goes down.

* **Instruction: `crank_turn_transition`**
    * **Caller:** Permissionless (Any player can call this).
    * **Parameters:** None.
    * **Logic:** This is the "Lazy Evaluation" failsafe. If a player notices that the 24-hour timer has expired but the turn hasn't advanced, they can call this instruction. 
    * **Incentive:** The contract checks the `Clock` sysvar. If the turn is legitimately overdue, it executes the turn transition logic and pays a small bounty (in Capital from the treasury) to the player who paid the gas to crank the contract.

#### **Phase 3: Global Settlement (The Payout)**
At the end of Turn 30, or if a Hegemon achieves total map dominance, the game halts. The `EpochManagerModule` freezes all AMMs and calculates the final Treasury value.

* **Instruction: `claim_epoch_yield`**
    * **Caller:** Any player with a `PlayerAccount` or holding winning Prediction Market shares.
    * **Parameters:** None (The contract derives the amounts from the user's token balances).
    * **Logic:** 1. Reads the finalized `RegionAccounts` to determine the Hegemon.
        2. Unlocks the initial Capital bids from the Pre-Epoch auction.
        3. Calculates the player's share of the Global Treasury yield based on their role and successful AMM trades.
        4. Transfers the final combined USDC/SOL payout directly to the user's wallet, burning their internal game tokens in the process.