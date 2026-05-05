# HEGEMONY

### *Trade the World State. Control the Narrative.*

**Hegemony** is a turn-based geopolitical strategy game built for the Solana ecosystem. It merges the spatial territory dynamics of *Risk* with the soft-power mechanics of *Twilight Struggle*, all underpinned by a live, on-chain Prediction Market. 

In Hegemony, Traditional RNG is replaced by capital flows. Players don't just play the board; they trade the geopolitical probability.

---

## 🚀 The Vision
Most games rely on black-box dice rolls or centralized servers. Hegemony moves the "Fate Engine" to the Automated Market Maker (AMM). 
*   **Actions as Markets:** Proposing an invasion or building a railway mints a prediction market. 
*   **Capital as Probability:** Heavy "YES" volume increases the mathematical probability of success.
*   **State Shocks:** Kinetic events (sabotage, blockades) are resolved via VRF, but their impact is dictated by the liquidity of the specific market.

---

## 🛠 Tech Stack
*   **Smart Contracts:** Rust / Anchor (Solana SVM).
*   **Economic Engine:** Constant Product AMM with specialized **Rounding-Up Protection** to ensure protocol solvency.
*   **Frontend:** Next.js, Tailwind CSS 4, Shadcn/UI.
*   **Onboarding:** Privy (Embedded Wallets + Social Login).
*   **Automation:** Python-based AI Agents (Intelligence Agency & Market Makers).
*   **Social Virality:** Solana Actions (Blinks) for native capital delegation.

---

## 🎮 Game Architecture

### 1. Asymmetric Player Roles
*   **State Actors (The Smart Money):** Capped at 7 per board. High-capital entities that win their seats via a **Pre-Epoch Blind Auction**. They are the only ones who can initiate infrastructure changes or trigger Covert Ops.
*   **Global Citizens (The Traders):** Unlimited players. They analyze the institutional order flow and trade the binary prediction markets. They provide the deep retail liquidity that the system needs to thrive.

### 2. The Dynamic Dominance Formula
Regional power isn't static. It is calculated dynamically on-chain:
$$Dominance = (Infrastructure \times 10) + (Market Confidence Index) - (Volatility Penalty)$$
Trading activity directly shifts the physical world state.

### 3. AI-Driven Intelligence Agency
A suite of off-chain agents scan the SVM state and use LLMs to generate end-of-turn **Strategic Alerts**, identifying regional laggards and market skews to guide player sentiment.

---

## 📦 Project Structure
```text
├── programs/hegemony/      # Rust Smart Contracts (Anchor)
├── agents/                 # Python AI Agents & Automation Layer
├── app/                    # Next.js Frontend Dashboard
├── scripts/                # Admin & Deployment Tooling
└── docs/                   # Full Technical Specifications
```

---

## 🛠 Getting Started

### 1. Engine Setup (Anchor)
```bash
anchor build
anchor test
```

### 2. Automation Layer (Agents)
```bash
cd agents
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python keeper.py  # Starts the automated turn-crank
```

### 3. Frontend Terminal
```bash
cd app
npm install
npm run dev
```

---

## 🏆 Hackathon Innovation Highlights
1.  **Blinks Integration:** Users can delegate $CAP to their favorite factions directly from X (Twitter) via our custom Solana Action.
2.  **AMM Solvency:** Custom integer math implementation that rounds in favor of the pool, preventing the $k$ invariant from decaying during high-volume trading.
3.  **Abstracted UX:** Using Privy to allow non-crypto users to participate in complex DeFi prediction markets through a simple "Game-Board" interface.

---

**Developed for the Colosseum Frontier Hackathon (2026).**
