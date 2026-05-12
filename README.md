# HEGEMONY

### *Trade the World State. Control the Narrative.*

Hegemony is a turn-based geopolitical strategy game built on Solana where prediction markets replace RNG for event resolution.

---

## 🚀 Quick Start (Local Development)

### 1. Start Validator & Deploy
```bash
# Terminal 1: Start local Solana validator
solana-test-validator --reset

# Terminal 2: Build and deploy the program
anchor build && anchor deploy
```

### 2. Initialize World State
```bash
# Setup the 5 asymmetric regions and global state
npx ts-node scripts/admin_init.ts
```

### 3. Launch Frontend
```bash
cd app
npm install
npm run dev
# Open http://localhost:3000
```

### 4. Activate AI Agents (Optional)
```bash
cd agents
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python keeper.py  # Automated turn transitions
```

---

## 🤖 AI Developer Guide

If you are using an LLM (like Gemini or Claude) to assist with development, provide the following files for full context:

1.  **`@gitingest.txt`**: The complete codebase snapshot.
2.  **`@docs/part1-hegemony_master_spec.md`**: The core game mechanics and architectural vision.

### Recommended AI Setup Prompt:
> "Review **@gitingest.txt** and **@docs/part1-hegemony_master_spec.md**. I want to setup the local development environment. Please check for any build errors, start the validator, deploy the program, initialize the game state using `scripts/admin_init.ts`, and finally launch the Next.js frontend and background AI agents."

---

## 📦 Project Structure
*   `programs/hegemony/`: Anchor/Rust Smart Contracts.
*   `app/`: Next.js Frontend Dashboard.
*   `agents/`: Python-based AI Automation Layer.
*   `docs/`: Full Technical Specifications.
