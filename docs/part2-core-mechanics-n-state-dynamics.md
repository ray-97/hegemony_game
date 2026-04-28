## **Part II: Core Game Mechanics & State Dynamics**

### **1. Dominance Level Calculation ($D_r$)**
The Dominance Level is a normalized integer (0-100) calculated per `RegionAccount`. It represents a faction's total grip on a territory, functioning as a dynamic equilibrium between physical infrastructure and on-chain market confidence.

#### **1.1 The Dominance Formula**
The raw dominance score ($R_r$) is calculated at the end of each turn using three weighted components:
`R_r = (α × I) + (β × MCI) - (γ × V)`

* **$I$ (Infrastructure Base):** The total value of functional infrastructure (e.g., Ports, Railways) in the region. Each level provides a fixed base score.
* **$MCI$ (Market Confidence Index):** The net positive liquidity locked in the region's Prediction Markets.
    * `MCI = Σ (Pool_Yes - Pool_No)` across all active macro/micro markets for that region.
    * If Traded Capital believes the region will fail (Heavy "NO" liquidity), the MCI becomes negative, dragging down the raw score.
* **$V$ (Volatility / Shock Penalty):** A decaying penalty applied when a region suffers a successful Micro_CovertShock (e.g., Grid Sabotage).

#### **1.2 Thresholds & State Triggers**
Because Solana smart contracts avoid floating-point operations, the raw score ($R_r$) is normalized to a 0-100 scale using a piecewise linear approximation (calculated in BPS).
* **Hegemonic Lock ($D_r = 100$):** Grants the controlling State Actor maximum yield multipliers until a systemic shock displaces them.
* **Contested ($D_r < 20$):** The `RegionAccount.status` flips to `Contested`, suspending all infrastructure yield until the state is stabilized.

---

### **2. Diplomatic Influence (DI) Mechanics**
Diplomatic Influence ($DI$) is a non-transferable, soulbound metric representing a State Actor's soft power, institutional leverage, and market trust. 

#### **2.1 Generation (Soft Power Accrual)**
$DI$ is earned by stabilizing the game's economic order book:
1. **Market Making:** Earned linearly based on the volume of resting limit orders placed on the AMM (tightening spreads).
2. **Structural Stability:** A flat dividend per turn if a region's $D_r$ remains > 80 with zero `Contested` statuses.
3. **Resolving Inefficiencies:** Bonus $DI$ awarded for deploying Capital to close massive pricing disparities (Fair Value Gaps) detected by Arbitrage Agents.

#### **2.2 Sinks / Utilization (Executive Action)**
$DI$ is consumed to manipulate market structure and board state without spending hard Capital:
1. **The "Veto" Shield (Defensive):** Expenditure drastically alters the Switchboard VRF probability matrix in favor of the defender during a Covert Op.
2. **AMM Fee Subsidies (Economic):** Temporarily reduces the dynamic taker fee on specific localized Prediction Markets to engineer a liquidity sweep into their territory (boosting MCI).
3. **Sanctions / Blockades (Offensive):** Prevents any new "YES" liquidity from entering a target region's Prediction Markets for exactly one turn, creating an artificial liquidity void.

#### **2.3 Anti-Spam & DI Constraints**
To prevent "Lame Duck" exploits where outgoing State Actors dump $DI$ maliciously:
1. **Passive Yield Multiplier (Opportunity Cost):** Unspent $DI$ acts as a multiplier during the Income Phase. Burning $DI$ directly slashes the State Actor's (and Delegators') guaranteed Capital income.
2. **The Pariah State Curve:** Multiple DI actions within a single turn face an escalating bonding curve cost ($1x, 2x, 4x$).
3. **Vulnerability Window:** Spending $DI$ offensively leaves the actor's own `RegionAccount` defenseless against Covert Ops for the remainder of the turn.
4. **Legacy Conversion:** If a State Actor is demoted to Trader, unspent $DI$ converts into permanent AMM fee rebates and a multiplier for future Epoch auction bids.

---

### **3. Covert Operations (Kinetic Shocks)**
Covert Ops are unilateral, high-risk executive actions. State Actors do not require a public vote, allowing them to engineer sudden liquidity sweeps without telegraphing their moves.

#### **3.1 Hybrid Cost Structure**
1. **The Kinetic Cost (Capital):** A hefty upfront fee in Capital. A portion pays the Switchboard VRF execution fee; the remainder is injected directly into the target's Prediction Market as "YES" liquidity (widening the profit margin for the attacker if they win their "NO" bet).
2. **The Political Cost ($DI$):** Scales dynamically with the target region's $D_r$. 

#### **3.2 The Accountability Mechanic (Delegator Flight)**
If an operation fails, the Escrowed Capital is forfeited to the Global Treasury, and the Faction suffers a $DI$ penalty. Traders who delegated Capital to that State Actor will likely execute an `undelegate_capital` transaction to flee the sinking ship, threatening the State Actor's seat in the next Epoch.

---

### **4. The Dual-Capital Architecture & Yield Engine**
To bypass Solana's Compute Unit (CU) limits during yield distribution and isolate AMM volatility from structural staking, the economy utilizes a dual-token model.

#### **4.1 Liquid Capital ($CAP)**
The universal reserve currency (SPL Token).
* **Utility:** Trading on AMMs, funding Covert Ops, auction bidding, and closing arbitrage gaps.
* **Source:** Minted 1:1 against user SOL/USDC deposits.

#### **4.2 Sovereign Bonds ($BOND_r$)**
A region-specific, yield-bearing receipt token (e.g., `$BOND_PanAsia`). Represents fractional ownership of a `RegionAccount`'s treasury.
* **Utility:** Meta-governance (delegation), passive yield accrual, and DeFi collateralization. 
* **Source:** Minted when a player stakes liquid `$CAP` into a specific region.

#### **4.3 The "Exchange Rate" Yield Distribution**
Yield is NOT pushed to individual wallets. The protocol deposits the turn's total yield (in `$CAP`) directly into the `RegionAccount`'s vault. 
* **Calculation:** `Bond Price = Region Vault Balance ($CAP) / Total $BOND_r Supply`
* When a player unstakes, they burn their `$BOND` and receive their principal + accrued yield automatically based on the current exchange rate. Unstaking enforces a strict **1-Turn Cooldown** to prevent mercenary capital extraction.

---

### **5. Player Onboarding & AMM Scope**

#### **5.1 Region Assignment & Migration**
* **Initial Entry:** Traders voluntarily choose their starting region during the Pre-Epoch Phase by staking initial `$CAP` to mint that region's `$BOND`.
* **Migration:** Players can migrate at any time, but must undergo the 1-Turn unstaking cooldown, suffering opportunity cost and potential slippage.

#### **5.2 AMM Trading & Information Asymmetry**
Trading is global—any player can trade on any region's AMM. However, holding a threshold of `$BOND` for a specific region grants Local Advantages:
* **Intelligence Briefs:** Exclusive access to localized AI-generated insights regarding chain data (e.g., detecting heavy "NO" liquidity on local infrastructure).
* **Fee Subsidies:** Dynamic trading fees are waived for "Home" markets. Foreign traders pay a premium tax that is routed directly to the local region's yield vault.