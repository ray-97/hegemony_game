# Colosseum Frontier Hackathon: "Hegemony" MVP Specification

## 1. Game Concept & Vision
"Hegemony" (working title) is a turn-based geopolitical strategy game built for the Solana ecosystem.
It merges the spatial territory dynamics of Risk with the soft-power and proxy-conflict mechanics of Twilight Struggle.
Crucially, traditional Random Number Generation (RNG) for event resolution is replaced or heavily supplemented by a live, on-chain Prediction Market.
Players do not just play the board; they trade the geopolitical narrative.

## 2. Core Mechanics: Engineering Liquidity & Displacement
The game balances long-term economic strategy with high-volatility kinetic events.

### The Economic Base (Trend Following)
* **Actions:** Players allocate capital to fund infrastructure (e.g., Deepwater Ports, Trans-Continental Railways, Rare Earth Mines).
* **Market Impact:** These are slow, multi-turn state changes. They create predictable trends in the Automated Market Maker (AMM), allowing players to park capital and act as baseline liquidity providers.

### Covert Operations (Systemic Shocks)
* **Actions:** Players fund "Grid Sabotage," "Naval Blockades," or "Proxy Insurgencies."
* **Market Impact:** These are single-turn, high-volatility events resolved via Verifiable Random Functions (VRF). Players can intentionally engineer buy-side liquidity on a predictable economic trend, then launch a covert operation to destroy the infrastructure, sweeping the liquidity of over-leveraged players.

## 3. Prediction Market Architecture
The market relies on binary (Yes/No) propositions linked directly to the on-chain game state.

| Thesis Type | Example Proposition | Market Dynamics |
| :--- | :--- | :--- |
| Macro (Trend-Based) | "Will the Pan-Asian Railway reach Level 5 completion by Turn 20?" | Slow moving, high TVL, reflects cumulative economic effort. |
| Micro (Event-Based) | "Will the South American incumbent regime survive a coup this turn?" | Highly volatile, speculative order flow, resolved via VRF. |

## 4. AI Integration Strategy (The "Linked Market" Solution)
To satisfy the Colosseum AI requirements and solve the complex on-chain problem of "linked prediction markets," the game utilizes off-chain AI agents to act as economic glue.

* **Isolated Smart Contracts:** Markets are built as isolated, independent AMMs to ensure smart contract simplicity and security.
* **AI Arbitrage Agents:** Python-based AI agents act as "Global Intelligence Agencies." They are programmed to understand geopolitical correlations (e.g., if a Deepwater Port is built, Naval Dominance is 80% more likely).
* **Execution:** When human players pump the Deepwater Port submarket, the AI agent detects the momentum and automatically buys shares in the Naval Dominance macro-market. This prevents liquidity fragmentation while making the gameworld feel highly reactive and interconnected.

## 5. Technical Stack
* **Smart Contracts:** Rust on the Solana Virtual Machine (SVM).
* **State Management:** `RegionAccount` structures tracking controlling factions, resource generation rates, infrastructure levels, and status enums (`Stable`, `Contested`, `Blockaded`).
* **Backend/Agents:** Python, leveraging LLMs for AI market-making logic and generating end-of-turn "intelligence briefs" based on the blockchain state.

## 6. Proposed 5-Week Hackathon Roadmap
* **Week 1-2 (Base State):** Develop Rust programs for the spatial hex-grid map, `RegionAccount` state transitions, and a basic AMM program.
* **Week 3 (Covert Ops):** Integrate Verifiable Random Functions (VRF) like Switchboard/Pyth for resolving sabotage and proxy wars.
* **Week 4 (AI Agents):** Build the Python backend and AI market-maker logic.
* **Week 5 (Frontend & Polish):** Develop the UI. The interface will feature the game map with a pop-up "Terminal" (order book) that appears when interacting with specific regions.

## 7. Core Game Logic & Turn Structure

### The Initial State (The Board)
To ensure a focused MVP within the hackathon timeframe, the game environment is constrained to the following parameters:
* **The Map:** A hex-grid representation comprising 5 to 7 strategic regions (e.g., North American Bloc, Pan-Asian Alliance, Middle Eastern Energy Sector).
* **The Resource:** All on-chain economic activity utilizes a single SPL token, "Capital," streamlining liquidity management.
* **Region Control:** Factions track "Dominance Levels" (0-100) and develop infrastructure (Levels 0-3) to generate passive Capital yields.

### The Turn Loop (Process Flow)
State transitions are processed chronologically via the smart contract:
1. **Income Phase:** Players accrue Capital based on current infrastructure dominance.
2. **Proposition Phase:** Capital is committed to initiate a new "Thesis" or geopolitical action.
3. **Trading Phase:** Humans and AI Agents trade binary shares on active market outcomes.
4. **Resolution Phase:** Markets resolve via time or VRF, updating the map state and distributing AMM liquidity.

### Prediction Market Mechanics
The differentiator lies in how AMM interactions replace traditional deterministic or RNG-based gameplay:
* **Actions as Markets:** Proposing an action (e.g., "Build Deepwater Port") mints a corresponding market; the initial cost provides the baseline "YES" liquidity.
* **Trading Dynamics:** Players access the Terminal to buy shares; prices are governed by a bonding curve reflecting capital flows and sentiment.
* **Resolution Hooks (RNG Replacement):**
    * **Economic Trends:** Success is determined by market skew; heavy "YES" volume results in infrastructure completion.
    * **Covert Shocks:** VRF-resolved, with "Success" probability mathematically weighted by "YES" liquidity. Capital effectively purchases probability.

### AI Agent Logic
The off-chain Python agents adhere to two primary behavioral directives:
* **Market Stabilization:** Scans for illiquid markets and injects "NO" liquidity to provide a counter-party for human players.
* **Linked Arbitrage:** Simulates geopolitical contagion; capital inflow into a regional war thesis triggers automated "NO" positions in local economic sub-markets.

## 8. Tokenomics & Protocol Monetization
To ensure strong business viability and a frictionless user experience, the protocol avoids speculative floating tokens and punitive winner taxes. Instead, it relies on an "Arcade Token" system and a sophisticated maker/taker rebate model.

### 8.1 The Buy-In Flow: The "Arcade Token" Model
* The game will run on a single SPL token called "Capital".
* "Capital" is a utility token pegged strictly to an underlying asset like SOL or USDC via a smart contract vault.
* **The Deposit:** A player connects their wallet and deposits 1 SOL into the game's Treasury Contract, which automatically mints and sends them 1,000 "Capital" tokens.
* **The Withdrawal:** When a player is done, they call a `withdraw` instruction. The contract burns their Capital and returns the equivalent SOL from the Treasury.
* **Why it works:** This abstracts away the volatility of crypto while playing. It also avoids the massive headache of having to seed a liquidity pool (like a Raydium SOL/CAPITAL pool) for a volatile, speculative in-game token on Day 1.

### 8.2 The Polymarket Fee Structure (Zero Winner's Tax)
Unlike traditional sportsbooks or regulated competitors that charge a "vig" or take a percentage of net gains upon market resolution, the protocol maintains a strict 0% fee on profits. Instead, the game utilizes a "Dynamic Taker-Fee Model":
* **Taker Fees:** The AMM charges a fee when a user executes an instant market order (taking liquidity).
* **Maker Rebates (The Circular Economy):** 100% of these collected taker fees are redistributed as "maker rebates" to the users who provide liquidity (the people placing limit orders).
* **Why it works:** By charging a taker fee and giving it to makers, the protocol incentivizes deep liquidity, which is the lifeblood of a prediction market.

### 8.3 Capturing the Spread & Market Making Mechanics
Market makers profit by capturing the "spread" (the difference between the buy and sell price) while providing a vital service to aggressive players who want immediate execution.

* **The Spread Example:** Imagine a market with a true probability of 50%. An AI Market Maker bot places a limit order to Buy at $0.48 and a limit order to Sell at $0.52. The $0.04 difference is the spread. If one player buys instantly and another sells instantly, the bot facilitates both trades and pockets the $0.04 difference.
* **External Market Makers (Crowdsourcing Liquidity):**
    * If a player sees a market moving sideways, they can place limit orders on both the YES and NO sides.
    * When an aggressive player buys their shares (e.g., during a covert op), the market maker captures the spread, and the smart contract pays them the taker fee as a rebate.
* **In-House Market Makers (The Protocol Revenue Engine):**
    * The protocol deploys Python "Global Intelligence Agency" bots whose sole job is to sit on the order book and provide baseline liquidity.
    * Because the protocol owns these bots, any maker rebates and spreads they earn flow directly back into the protocol's Treasury.
    * The protocol makes money because its AI bots are the most efficient market makers on the board, constantly earning rebates.

### 8.4 The Hackathon Pitch Summary
This economic model provides a flawless business pitch for the Colosseum judges:
1. **Zero-Friction Growth:** We don't punish winners with a settlement tax.
2. **Deep Liquidity:** We use dynamic taker fees to fund maker rebates, incentivizing players to provide liquidity.
3. **AI Monetization:** Our primary protocol revenue comes from our proprietary AI agents acting as automated market makers and sweeping up those maker rebates.

## 9. UI/UX Architecture: The Two-Tiered Interface
To prioritize user acquisition and ensure a smooth onboarding experience during the hackathon judging phase, the game employs a progressive disclosure UI model. The interface starts as a simple, gamified board game and can later expand into a full-fledged decentralized finance (DeFi) trading terminal.

### 9.1 Phase 1: The "Gamified" MVP Interface (Hackathon Focus)
The primary goal of the MVP UI is to hide the complex order book mechanics and make trading feel like natural board game actions.
* **The Focal Point (The Map):** The center of the screen is dominated by the interactive hex-grid or territory map.
* **The Context Panel:** When a user clicks on a region (e.g., "Pan-Asian Alliance"), a sleek side-panel slides out. This panel displays the region's current stats, infrastructure levels, and active geopolitical events.
* **Abstracted Trading (One-Click Liquidity):** Instead of showing bids, asks, and order depth, active prediction markets are presented as simple narrative choices.
    * **Example:** "Event: Deepwater Port Construction."
    * **Buttons:** Users see two large buttons: "Support Project (YES)" and "Sabotage/Oppose (NO)".
    * **Action:** Clicking a button opens a simple slider to select how much "Capital" they want to allocate. Under the hood, this slider simply executes a market order on the AMM, but to the user, it feels like they are funding a geopolitical strategy.

### 9.2 Phase 2: The "Pro Terminal" (Post-Hackathon Expansion)
Once the base game is functional, a toggle can be added for power users, market makers, and arbitrageurs who want granular control over their capital.
* **The Interface Swap:** Toggling "Pro Mode" shrinks the spatial map to a minimap in the corner and brings the financial data to the forefront.
* **Visible Order Books:** The simple "Support/Oppose" buttons are replaced with a traditional crypto trading terminal. Users can see the exact resting limit orders (bids and asks) for every geopolitical thesis.
* **Advanced Routing:** Pro users can manually place their own limit orders at specific price points to capture the spread, essentially acting as manual market makers against the more casual, gamified user base.
* **Depth Charts:** Visual representations of liquidity pools allow advanced players to easily identify which infrastructure projects are heavily backed and which are vulnerable to a sudden "covert operation" liquidity sweep.

## 10. Player Scaling & Match Architecture: The Epoch Model
To ensure deep prediction market liquidity while maintaining competitive fairness, "Hegemony" abandons traditional small-lobby matchmaking in favor of a massive, asymmetric, time-bound structure called the "Epoch Model."

### 10.1 Asymmetric Player Hierarchy (Institutions vs. Retail)
Instead of a flat structure where every player is a country, the game divides the player base into two distinct roles, simulating the relationship between institutional order flow and retail liquidity.
* **The State Actors (The "Smart Money"):**
    * **Limit:** Exactly 5 to 7 per board (e.g., The 5 Global Factions).
    * **Role:** These are highly capitalized players, DAOs, or advanced AI Agents. They are the only entities that can actually propose on-chain infrastructure changes or trigger covert operations. They dictate the macro trends and often engineer geopolitical shocks specifically to sweep liquidity from the AMMs.
* **The Global Citizens (The Traders):**
    * **Limit:** Unlimited.
    * **Role:** The general player base. They do not control the map directly. Instead, they read the board state, analyze the institutional order flow, and trade the prediction markets. They provide the massive retail liquidity that the AMMs need to function. They can ride a State Actor's trend for steady yield, or try to front-run a covert operation.

### 10.2 The Game Session: The "Epoch"
The game runs in a single, global instance (or a few high-capacity regional instances) that operates on a seasonal timeframe known as an Epoch.
* **Duration:** An Epoch lasts for a strict, predetermined timeframe (e.g., 2 weeks or 1 month).
* **The Progression:** During the Epoch, State Actors build infrastructure, trigger shocks, and fight for dominance, while Traders furiously exchange Capital on the AMMs.
* **Settlement Day:** At the exact end of the Epoch, the game halts. The smart contracts execute a final "Global Settlement." All active AMMs resolve based on the final board state. The Faction with the highest Dominance Score is declared the Hegemon, and a massive portion of the protocol's Treasury (accumulated from fees/AI market making) is distributed to that Faction and its top retail backers.
* **The Reset:** The board is wiped clean, Capital balances are snapshotted and withdrawable to SOL, and a new Epoch begins from scratch.

### 10.3 Why This Architecture Wins
* **Concentrated TVL:** By having thousands of "Traders" interacting with only 5-7 active "State Actors" on a single board, you ensure every prediction market AMM has incredibly deep liquidity.
* **Definitive Yield:** The strict end-date guarantees that all markets will resolve, giving traders confidence that their Capital won't be locked up in a perpetual stalemate.
* **The "Wipe" Hype:** Just like Rust or Escape from Tarkov, the seasonal server wipe creates a massive recurring hype cycle. Everyone starts Turn 1 of the new Epoch on equal footing, completely eliminating the Latecomer Penalty.

## 11. State Actor Management & Scaling
The Asymmetric Epoch Model relies on the intentional scarcity of "State Actor" roles, capped at 5-7 slots per board. This architecture concentrates TVL and ensures that the factions dictating the board state represent "smart money" capable of generating significant market displacement. To resolve high demand for these limited slots, the protocol utilizes an on-chain competitive selection phase and horizontal scaling primitives.

### 11.1 The Pre-Epoch Phase: Earning the Seat
Prior to Turn 1, the game enters a 48-hour "Pre-Epoch" buffer. During this window, aspiring State Actors must compete for institutional status via one of two primary mechanisms:

* **Mechanism A: The Blind Auction (Capital Supremacy)**
    * **Action:** Any wallet or DAO submits a sealed "Capital" bid to the protocol Treasury.
    * **Outcome:** At the close of the buffer, the top 5 highest bidders are granted State Actor privileges.
    * **Market Impact:** Winning bids are locked into the Epoch's central prize pool. State Actors effectively fund the baseline liquidity that retail Traders speculate against, ensuring deep initial TVL.
* **Mechanism B: The Delegation Model (Liquid Democracy)**
    * **Action:** Aspiring State Actors deploy "Manifesto" contracts outlining their strategy. Retail Traders delegate "Capital" to the Actor they believe will dominate the Epoch.
    * **Outcome:** The 5 entities with the highest delegated TVL are designated as State Actors.
    * **Market Impact:** This engineers a pre-game meta where State Actors function as fund managers. If the Actor wins the Epoch, delegated retail players capture a proportional share of the settlement yield.

### 11.2 Horizontal Scaling: Managing Excess Demand
To capture institutional demand beyond the 7-slot limit, the protocol scales horizontally by spinning up parallel Epoch instances.
* **Tiered Boards:** The protocol hosts concurrent Epochs with varying entry requirements, mirroring different asset classes.
    * **The Sovereign Board:** Minimum auction bid of $100k USDC. High-stakes environment with massive retail order flow.
    * **The Contested Boards:** Minimum auction bid of $1k USDC. Lower barrier to entry for smaller DAOs or individual whale players.
* **The Benefit:** This prevents a monopoly by the top wallets and allows the protocol to capture all available institutional liquidity by simply instantiating new smart contract boards.

### 11.3 The In-Game Mechanics of a State Actor
State Actors do not merely play the board; they act as the market makers of the physical world state.
* **Engineering Displacement:** Leveraging information asymmetry, a State Actor planning a "Naval Blockade" on Turn 5 can quietly accumulate cheap "NO" shares during earlier turns.
* **Sweeping Liquidity:** Upon execution of the blockade, the market reprices violently. The State Actor profits from the displacement, effectively sweeping the retail liquidity resting on the buy-side of the infrastructure market.

## 12. Advanced System Dynamics & Operational Edge Cases

### 12.1 Temporal Resolution: The Turn vs. Real-Time Paradox
* **The Thesis:** How does a discrete "turn" function within a real-time trading environment, and what is the functional necessity of the 48-hour pre-epoch window?
* **The Mechanics:** Pure real-time execution is technically prohibitive in a blockchain context due to latency and cost. A deterministic "Turn Structure" is required to sequence global operations.
* **Time Mapping:** Each "Turn" represents a 24-hour real-world cycle. A 30-day Epoch consists of exactly 30 state-transition cycles.
* **The Pre-Epoch:** This 48-hour buffer occurs prior to Turn 1, dedicated to the competitive selection of State Actor slots and the aggregation of baseline capital.
* **Turn Logic:** While prediction market (AMM) trading is continuous, in-game state changes (e.g., infrastructure development) require a formal "Resolution Phase." This allows the market sufficient time to discover price curves and consolidate liquidity before the smart contract executes the update.

### 12.2 Hybrid Bidding Architecture (Whales vs. Syndicates)
* **The Thesis:** Can individual users compete against institutional DAOs through self-funding or collective manifestos?
* **The Mechanics:** The protocol utilizes a hybrid model mirroring DeFi primitives. The underlying contract remains agnostic to the source of Capital submitted to the Blind Auction.
* **Solo Whales:** High-net-worth players can personally deposit Capital, assuming total risk-reward exposure for their faction.
* **Syndicate Vaults:** Strategic players can deploy "Manifesto Vault" contracts to crowdsource Capital. By pooling retail liquidity into a single aggregated bid, skilled individual strategists can effectively challenge well-capitalized DAOs.

### 12.3 Commodities Modeling & The Geopolitical Trilemma
* **The Thesis:** How should the protocol model resource markets (Energy, Oil, Tech) to engineer systemic "ripple effects"?
* **The Mechanics:** Incorporating commodity-based volatility creates the necessary complexity. Regions are defined by resource specialization, with "Tech" serving as a proxy for semiconductor and software hegemony.
* **The Trilemma Framework:** Every event triggers a cascade across regional and global markets:
    * **Primary Benefit:** The localized goal (e.g., a Rare Earth Mine increases Tech output).
    * **Secondary Cost:** The immediate local trade-off (e.g., increased resource extraction reduces Diplomatic Influence).
    * **Tertiary Shock:** Global contagion (e.g., surging tech supply lowers the barriers for rival Drone production, crashing "NO" share value in the rival's infrastructure market).

### 12.4 Power Balance & The Hegemon Constraint
* **The Thesis:** How does the protocol sustain asymmetric balance, and what mechanics govern the displacement of the lead Faction?
* **The Mechanics:** Geopolitics relies on asymmetric friction. Designating a Hegemon at Turn 0 creates an immediate macro-target for the rest of the board.
* **The Hegemon's Burden:** The leader possesses superior infrastructure and Capital yield but faces systemic headwinds.
* **Self-Balancing Dynamics:** As the Hegemon grows, "YES" shares in its success become prohibitively expensive, while "NO" shares offer high leverage. This incentivizes rivals to fund sabotage and covert ops by buying up cheap "NO" liquidity.
* **Displacement:** Hegemony is lost when "Dominance Levels" (0-100) shift due to rival expansion or the degradation of the leader's infrastructure.

### 12.5 Monetary Policy: The Sovereign Wealth Engine
* **The Thesis:** Can the protocol manipulate Capital supply or printing like a Central Bank to stimulate the game economy?
* **The Mechanics:** Central bank "money printing" is strictly prohibited as it risks protocol insolvency. All Capital must be fully backed.
* **The Peg Constraint:** "Capital" is hard-pegged to SOL/USDC. Since players can burn Capital for Treasury assets at any time, unbacked issuance would destroy the protocol's liquidity pool.
* **The Sovereign Wealth Model:** The protocol acts as a Sovereign Wealth Fund. In-House AI agents capture spreads and maker rebates, funneling these backed profits into the Treasury.
* **Stimulus & Seed Liquidity:** Revenue from AI market-making is used for fair stimulus, like subsidizing yields. Initial liquidity is crowd-sourced from State Actor bids; protocol-funded bids are a last resort to ensure a fully populated order book.
