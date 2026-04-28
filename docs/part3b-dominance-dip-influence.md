### **7. Dominance Level Calculation ($D_r$)**

The Dominance Level is a normalized integer (0-100) calculated per `RegionAccount`. It represents a faction's total grip on a territory. Rather than a static score, it is a dynamic equilibrium between physical infrastructure and on-chain market confidence.

#### **7.1 The Theoretical Formula**
The raw dominance score ($R_r$) is calculated at the end of each turn (during `process_turn_transition`) using three weighted components:

$$R_r = (\alpha \times I) + (\beta \times MCI) - (\gamma \times V)$$

* **$I$ (Infrastructure Base):** The total value of functional infrastructure (e.g., Ports, Railways) in the region. Each level provides a fixed base score.
* **$MCI$ (Market Confidence Index):** The net positive liquidity locked in the region's Prediction Markets.
    * $MCI = \sum (Pool_{Yes} - Pool_{No})$ across all active macro/micro markets for that region.
    * If Traded Capital believes the region will fail (Heavy "NO" liquidity), the MCI becomes negative, dragging down the raw score.
* **$V$ (Volatility / Shock Penalty):** A decaying penalty applied when a region suffers a successful Micro_CovertShock (e.g., Grid Sabotage).

#### **7.2 On-Chain Normalization (Solana Integer Math)**
Because Solana smart contracts avoid floating-point operations, the raw score ($R_r$) is normalized to a 0-100 scale using a piecewise linear approximation of a sigmoid function, calculated in Basis Points (BPS) or via a scaled Wad multiplier.

* If a region reaches $D_r = 100$, it triggers a "Hegemonic Lock," granting the controlling State Actor maximum yield multipliers until a systemic shock displaces them.
* If a region drops below $D_r = 20$, the `RegionAccount.status` flips to `Contested`, suspending all infrastructure yield until stabilized.

---

### **8. Diplomatic Influence (DI) Mechanics**

**Concept:** If "Capital" is the hard economic currency used to buy shares and build infrastructure, "Diplomatic Influence" ($DI$) is a non-transferable, soulbound metric representing a State Actor's soft power and institutional leverage. 

#### **8.1 Generation (How it comes about)**
$DI$ is earned by actions that stabilize the game's economic order book and provide baseline liquidity.

1.  **Market Making (Liquidity Provision):** State Actors earn $DI$ linearly based on the volume of resting limit orders they place on the AMM. By tightening the spread and absorbing volatility, they earn political capital.
2.  **Structural Stability:** A region generates a flat $DI$ dividend per turn if its $D_r$ remains above 80 with zero active `Contested` statuses. 
3.  **Resolving Inefficiencies:** If an off-chain Arbitrage Agent detects a massive pricing disparity (e.g., a localized panic creating a Fair Value Gap in the order book), players who deploy Capital to close that gap and restore parity are rewarded with a $DI$ bonus upon turn resolution.

#### **8.2 Sinks / Utilization (What it is used for)**
$DI$ is consumed by State Actors to bend the rules of the Epoch and manipulate market structure without spending hard Capital.

1.  **The "Veto" Shield (Defensive):** * *Action:* Expend $DI$ to temporarily upgrade a `RegionAccount`'s resistance to covert ops.
    * *Mechanic:* When an adversary funds a "Grid Sabotage" (resolved via Switchboard VRF), spending $DI$ drastically alters the probability matrix in favor of the defender (e.g., reducing the attack's success rate from 60% to 15%).
2.  **AMM Fee Subsidies (Economic):**
    * *Action:* Expend $DI$ to temporarily reduce the dynamic taker fee on specific Prediction Markets.
    * *Mechanic:* A State Actor can make it cheaper for Traders to buy "YES" shares on their own region's thesis, effectively engineering a liquidity sweep into their territory to boost their $MCI$ (Market Confidence Index).
3.  **Sanctioning / Blockades (Offensive):**
    * *Action:* Target a rival `RegionAccount` by spending a massive amount of $DI$.
    * *Mechanic:* Prevents any new "YES" liquidity from entering that region's Prediction Markets for exactly one turn. This creates an artificial liquidity void, allowing the attacking State Actor to cheaply accumulate "NO" shares before launching a physical attack.

#### **8.3 Rust Implementation Struct Updates**

```rust
// Added to PlayerAccount
pub struct PlayerAccount {
    pub role: Role,
    pub capital_balance: u64,
    pub diplomatic_influence: u64, // Soulbound, non-transferable
    pub delegated_to: Option<Pubkey>,
}

// Added to EpochManagerModule
pub fn spend_diplomatic_influence(
    ctx: Context<SpendDI>, 
    action_type: DiplomaticAction, 
    target_region: Pubkey
) -> Result<()> {
    // 1. Verify caller has sufficient DI.
    // 2. Burn DI from PlayerAccount.
    // 3. Apply state modifiers to target_region based on action_type (Shield, Sanction, etc.)
}