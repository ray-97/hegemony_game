## **Part V: The Pre-Epoch Auction & State Actor Selection**

### **14. Auction Architecture & The "Manifesto"**
Before Turn 1 begins, the network must determine who will control the 5 Hegemonic Regions. This is resolved via a competitive, time-locked auction.

Players bid for a *specific* region's seat (e.g., bidding to control the Pan-Asian Alliance). They do this by staking liquid `$CAP` and publishing a "Manifesto." 

* **The Manifesto:** An IPFS/Arweave hash linked in their bid account. It outlines their geopolitical strategy, intended infrastructure investments, and dividend promises to attract Traders to delegate Capital to them.
* **Bid Weight:** A player's total auction power is: `Principal $CAP Staked + Delegated $CAP`.

### **15. The Continuous Leaderboard Optimization (SVM Compute Saver)**
Instead of sorting all bids when the auction ends, the smart contract maintains a strict `RegionLeaderboard` PDA for each of the 5 regions.

* Each Region's leaderboard only stores the single highest `Active_Bidder_Pubkey` and their `Total_Bid_Weight`.
* When a player submits a bid, the contract instantly compares it to the current leader. If it is higher, the contract overwrites the PDA state, crowning a new temporary leader and kicking the old leader's `$CAP` back to their wallet (or a claimable escrow).
* **Resolution Complexity:** $O(1)$. When the auction timer expires, the protocol simply reads the 5 PDAs, locks their Capital into the region's vault, and mints them `$BOND_r`.

### **16. The Delegation Mechanic (Trader Meta-Game)**
Traders who do not want the burden of being a State Actor can function as Kingmakers.

* **Delegating:** A Trader locks their `$CAP` into an aspiring State Actor's bid account. 
* **If the State Actor Wins:** The Trader's `$CAP` is transferred to the Region's vault alongside the State Actor's principal, and the Trader is minted equivalent `$BOND_r` (securing them a share of the infrastructure yield).
* **If the State Actor Loses:** The Trader's `$CAP` is simply unlocked and returned to their liquid wallet.

---

### **17. Rust Implementation (Anchor Framework Structs & Instructions)**

#### **17.1 The Account Structs**

```rust
#[account]
pub struct RegionLeaderboard {
    pub region_id: String,          // e.g., "Pan_Asian_Alliance"
    pub current_leader: Pubkey,     // Wallet of the top bidder
    pub leader_manifesto_uri: String, 
    pub total_bid_weight: u64,      // Principal + Delegated $CAP
    pub auction_end_timestamp: i64, 
}

#[account]
pub struct BidderEscrow {
    pub owner: Pubkey,
    pub target_region: String,
    pub principal_capital: u64,
    pub delegated_capital: u64,
}

17.2 The Instruction Contexts

submit_manifesto_bid
Logic: Opens a BidderEscrow PDA for the user. Transfers their $CAP from their SPL token account to the program's vault. If their principal_capital is higher than the RegionLeaderboard.total_bid_weight, they temporarily become the current_leader.

delegate_to_bidder
Logic: A Trader specifies a BidderEscrow PDA. They transfer their $CAP to the program vault, and the contract increments the target's delegated_capital.
Trigger: The contract then re-evaluates the target against the RegionLeaderboard. If this new delegation pushes the target's total weight above the current leader, the target takes the throne.

resolve_epoch_auction
Caller: The Keeper/Crank script (once Clock.unix_timestamp > auction_end_timestamp).
Logic: 1. Reads the 5 RegionLeaderboard PDAs.
2. Updates the GlobalEpochAccount, setting epoch_status to Active.
3. Assigns the controlling_faction in each RegionAccount to the respective winning pubkeys.
4. Initializes the Exchange Rate for all 5 regions (Total Bid Weight = Vault Balance. Mints 1:1 $BOND_r to the winners and their delegators).
