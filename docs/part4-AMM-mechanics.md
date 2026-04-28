## **Part IV: AMM Mechanics & The Binary Bonding Curve**

### **10. The Binary Market Structure**
The Prediction Markets in *Hegemony* trade binary outcomes (e.g., "Will the Pan-Asian Alliance suffer a Grid Sabotage by Turn 5?"). 

To enable this, the AMM enforces a strict invariant: 
$$1 \text{ } \$CAP = 1 \text{ YES Share} + 1 \text{ NO Share}$$

This means the protocol can mint an infinite supply of YES and NO shares, as long as they are minted in perfect pairs and backed 1:1 by `$CAP` in the vault.

### **11. Market Initialization & Liquidity Provision**
When a State Actor or Trader proposes a new thesis (creating a market), they must seed it with initial liquidity ($L$).

1. The Creator deposits $L$ `$CAP` into the market vault.
2. The protocol mints $L$ YES shares and $L$ NO shares.
3. Both sets of shares are deposited into the AMM Pool. 

**Initial Pool State:**
* $Pool_{yes} = L$
* $Pool_{no} = L$
* Constant Product ($k$) = $L \times L = L^2$

The initial price of a YES share ($P_{yes}$) is defined by the ratio of the opposite pool to the total pool:
$$P_{yes}=\frac{Pool_{no}}{Pool_{yes} + Pool_{no}} = 0.50 \text{ } \$CAP$$

---

### **12. The Trade Math (Buying YES Shares)**
When an Arbitrage Agent or Trader wants to bet on an outcome, they do not just buy shares from a static pool; they mint pairs and swap. 

Assume a player wants to invest $dx$ `$CAP` to buy YES shares on an impending Covert Op.

**Step 1: Minting Pairs**
The protocol takes the player's $dx$ `$CAP` and mints $dx$ YES and $dx$ NO shares directly to the player's temporary buffer.

**Step 2: The Automated Swap**
The player keeps the $dx$ YES shares, but they don't want the NO shares. The protocol automatically forces the player to swap their $dx$ NO shares into the AMM pool in exchange for $dy$ YES shares, using the $x \times y = k$ invariant.

**The Math:**
The new NO pool becomes $Pool_{no} + dx$. 
To maintain $k$, the new YES pool must shrink:
$$(Pool_{yes} - dy) \times (Pool_{no} + dx) = k$$

Solving for $dy$ (the amount of YES shares pulled from the pool):
$$dy=Pool_{yes} - \frac{k}{Pool_{no} + dx}$$

**Step 3: Final Payout**
The total YES shares the player receives ($Shares_{received}$) is the sum of the newly minted shares plus the swapped shares:
$$Shares_{received}=dx + dy$$

*Note: As the player buys YES, the $Pool_{yes}$ shrinks and the $Pool_{no}$ grows. This mathematically pushes the price of YES ($P_{yes}$) higher toward 1.00 `$CAP`, making subsequent attacks more expensive to fund.*

---

### **13. Resolution & Settlement**
When the Turn ends or the Switchboard VRF resolves the Covert Op, the market expires.

1. **If the Thesis is TRUE (e.g., Sabotage Successful):**
   * The smart contract sets the value of 1 YES = 1 `$CAP`.
   * The value of 1 NO = 0 `$CAP`.
   * Players invoke the `claim_payout` instruction, burning their YES shares to withdraw `$CAP` from the vault.
2. **If the Thesis is FALSE:**
   * 1 NO = 1 `$CAP`. 1 YES = 0 `$CAP`.

Any `$CAP` left in the vault from the losing side (the "wrong" shares that the AMM pool was holding) is swept. A percentage pays the initial Liquidity Provider, and the rest is sent to the Region's `$BOND` yield vault as a reward for surviving the market pressure.