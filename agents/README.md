# Hegemony: AI Agents & Automation

This folder contains the off-chain infrastructure for the Hegemony game, written in Python.

## Scripts

1. **`keeper.py`**: An automated "Turn Crank" that monitors the on-chain clock and advances the turn when the 24-hour cycle expires.
2. **`market_maker.py`**: A stabilization bot that monitors prediction markets and provides "NO" liquidity for illiquid theses.

## Setup

1. **Create Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run a Bot**:
   ```bash
   # Ensure a local validator is running and the program is deployed
   python market_maker.py
   ```

## Configuration

The bots default to using the keypair at `~/.config/solana/id.json` and connect to a local validator at `http://localhost:8899`.
