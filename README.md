# a-MANT

**Autonomous AI Savings Vault on Mantle L2**

Built for the [Mantle Turing Test Hackathon 2026](https://dorahacks.io/hackathon/mantleturingtesthackathon2026/detail) — AI x RWA track.

---

## What It Is

a-MANT is an autonomous AI agent that protects and grows your savings on Mantle L2. You deposit USDY or mETH, set a goal, and the AI does everything else — rebalancing allocations, protecting against depeg events, compounding yield — without requiring any action from you.

The product targets people in emerging markets where local currencies lose value, who want a safe place for savings that automatically stays ahead of inflation.

**It is not a chatbot with a wallet.** The AI executes real on-chain transactions autonomously. The chat interface (SAGE) is a secondary window into what the AI has already done, not the primary product.

---

## Core Architecture

```
a-MANT
├── HORIZON Layer    — Monitors macro signals (Fed rate, Ondo health, ETH staking, volatility)
├── Decision Engine  — 5-priority rule system, acts only when confidence > 70%
├── Chronicle Layer  — Every AI decision becomes a "chapter" — your savings story
└── SAGE Interface   — Ask Axiom anything about your portfolio
```

### Three Smart Contracts

| Contract | Role |
|---|---|
| `AMANTVault` | Holds user funds (USDY + mETH), records allocations |
| `AMANTAgent` | ERC-8004 soulbound NFT — AI identity + reputation scoring |
| `AMANTChronicle` | ERC-721 milestone NFTs — on-chain chapter record |

### Agent Decision Rules (Priority Order)

1. Ondo health score < 80 → **PROTECT**: move all mETH to USDY
2. Volatility > 70 AND user in SAFE mode → **PROTECT**
3. ETH staking rate trending down AND < 3.0% → **REBALANCE** mETH → USDY
4. Fed rate trending down AND < 4.0% AND risk mode >= BALANCED → **REBALANCE** USDY → mETH
5. APY differential > 1.5% → **REBALANCE** 35% toward better yield
6. Default: **HOLD**

---

## Monorepo Structure

```
a-mant/
├── web/                     # Next.js 15 frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Onboarding flow (5 steps)
│       │   ├── app/page.tsx          # Dashboard
│       │   ├── app/chronicle/page.tsx # Chapter timeline
│       │   ├── app/chat/page.tsx     # SAGE chat interface
│       │   └── api/chat/route.ts     # Claude API proxy
│       ├── components/ui/   # Button, Card, Progress
│       ├── hooks/           # useVault, useAgent (wagmi read hooks)
│       ├── lib/             # wagmi config, contract ABIs
│       ├── store/           # Zustand onboarding state
│       └── types/           # Shared TypeScript types
│
├── contract/                # Hardhat — Solidity contracts
│   ├── contracts/
│   │   ├── AMANTVault.sol
│   │   ├── AMANTAgent.sol
│   │   └── AMANTChronicle.sol
│   └── scripts/deploy.ts
│
└── agent/                   # Node.js autonomous agent (runs on a server)
    └── src/
        ├── signals/
        │   ├── macro.ts     # FRED, beaconcha.in, DeFiLlama, Fear & Greed
        │   └── onchain.ts   # Aave APY reader
        ├── engine/
        │   └── decision.ts  # 5-rule decision engine
        ├── executor/
        │   └── index.ts     # viem write client — executes on-chain
        ├── narrator/
        │   └── index.ts     # Claude API — generates chapter narratives
        └── index.ts         # node-cron, runs every 15 minutes
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Manrope font, framer-motion |
| Web3 | wagmi v2, viem, injected + MetaMask connectors |
| Smart Contracts | Solidity 0.8.24, OpenZeppelin v5.2, Hardhat |
| Agent | Node.js, viem write client, node-cron |
| AI | Anthropic Claude claude-sonnet-4-6 (narratives + chat) |
| Data | FRED API, beaconcha.in, DeFiLlama, alternative.me |
| Chain | Mantle L2 (chainId 5000 mainnet / 5003 testnet) |

---

## RWA Assets

| Token | Description | Address (Mantle) |
|---|---|---|
| USDY | Ondo Finance — US Treasury-backed stablecoin, ~4.5% APY | `0x5bE26527e817998A7206475496fDE1E68957c5A6` |
| mETH | Mantle Liquid Staking Token, ~3.8% APY | `0xcDA86A272531e8640cD7F1a92c01839911B90bb0` |

---

## Environment Variables

Copy `.env.example` to `.env` in the root:

```env
# Required for contract deployment and agent execution
PRIVATE_KEY=0x...

# Mantle RPC (optional override)
MANTLE_RPC_URL=https://rpc.mantle.xyz

# Deployed contract addresses (filled after deploy)
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_AGENT_ADDRESS=0x...
NEXT_PUBLIC_CHRONICLE_ADDRESS=0x...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Signal data
FRED_API_KEY=...        # https://fred.stlouisfed.org/docs/api/api_key.html

# Agent monitoring
MONITORED_USERS=0xADDR1,0xADDR2
```

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm install
```

### Run web locally

```bash
pnpm dev:web
# → http://localhost:3000
```

### Compile contracts

```bash
pnpm build:contract
```

### Run agent locally (one cycle)

```bash
cd agent
cp ../.env .env
pnpm dev
```

---

## Contract Deployment

### Testnet (Mantle Sepolia)

```bash
# 1. Fund your deployer wallet with testnet MNT
# Faucet: https://faucet.sepolia.mantle.xyz

# 2. Deploy all three contracts
pnpm deploy:testnet

# 3. Copy the printed addresses into your .env
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_AGENT_ADDRESS=0x...
NEXT_PUBLIC_CHRONICLE_ADDRESS=0x...
```

### Mainnet

```bash
pnpm deploy:mainnet
```

The deploy script wires all contracts together:
- `vault.setChronicle(chronicle)` 
- `agent.setVault(vault)` 
- `agent.setAuthorizedLogger(agentWallet)` 
- `chronicle.setAuthorizedWriter(agentWallet)`

---

## User Flow

```
1. Set goal amount ($)
2. Set duration (months)
3. Choose risk mode (Safe / Balanced / Aggressive)
4. Connect wallet
5. Activate Axiom (mints soulbound Agent NFT)
6. Deposit USDY or mETH into vault
7. AI monitors every 15 minutes → rebalances when needed
8. Each action creates a Chronicle chapter
9. User can ask Axiom anything via chat
```

---

## Design Principles

- **No jargon on the surface.** Terms like "rebalance" and "yield" appear in the detail layer, never in the primary UI.
- **One number matters.** The dashboard leads with total portfolio value and goal progress — not APY tables or token breakdowns.
- **AI acts, you observe.** The app surfaces what the AI decided, not a list of options for you to click.
- **Dark, premium, minimal.** Background `#0a0a0f`, accent `#ffefc5` (warm amber), Manrope variable font. No emoji. No gradients for decoration.

---

## License

MIT
