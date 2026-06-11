# AGENTS.md

## Repo Structure

pnpm monorepo with 3 packages:
- `web/` — Next.js 15 + React 19 frontend (wagmi, viem, zustand, Tailwind)
- `contract/` — Hardhat Solidity 0.8.24 (OpenZeppelin 5.2)
- `agent/` — Node.js autonomous agent (viem write client, node-cron, Claude API)

Each package is independent. No shared code between them except contract ABIs (generated in `contract/artifacts/`).

## Commands

```bash
pnpm install              # install all deps (must run from root)
pnpm dev:web              # Next.js dev server → localhost:3000
pnpm build:web            # next build (use to verify web changes)
pnpm dev:agent            # runs agent via tsx watch (watches for changes)
pnpm build:contract       # hardhat compile → artifacts/
pnpm test:contract        # hardhat test (no tests exist yet)
pnpm deploy:contract      # deploy to Mantle mainnet
```

No root-level lint or typecheck command. Verify web changes with `pnpm build:web`. Agent has no lint script; verify with `npx tsc --noEmit` from `agent/`.

## Key Quirks

- **No test files exist** for contracts or agent. Do not assume tests will catch regressions.
- **Hardhat config** loads `.env` from `../.env` (root), not `contract/.env`.
- **Agent env**: copy root `.env` into `agent/.env` before running locally.
- **Contract deploy** wires contracts together (vault↔agent, vault↔chronicle, chronicle↔agent). See `contract/scripts/deploy.ts`.
- **ERC-8004**: Agent identity contract (soulbound NFT). This is a hackathon-specific standard — do not confuse with standard ERC-721.
- **Solidity**: optimizer enabled, 200 runs, evmVersion `cancun`. Keep this when modifying contracts.
- **Web path aliases**: `@/*` maps to `./src/*`.
- **Agent path aliases**: `@/*` maps to `./src/*` (same pattern, different base).

## Environment

- `.env.example` at root defines all vars. Copy to `.env`.
- `NEXT_PUBLIC_*` vars are inlined at build time — changing them requires rebuilding web.
- `PRIVATE_KEY` is used by both contract deploy and agent execution.
- `FRED_API_KEY` — free tier, no billing required. `ALCHEMY_API_KEY` — optional.

## Smart Contracts

Three contracts, all in `contract/contracts/`:
- `AMANTVault.sol` — holds USDY + mETH, manages deposits/withdrawals/rebalance
- `AMANTAgent.sol` — ERC-8004 agent identity, reputation scoring, authorized actions
- `AMANTChronicle.sol` — ERC-721 NFTs for on-chain chapter records

## Agent Architecture

Runs on `node-cron` (every 15 min). Decision engine in `agent/src/engine/decision.ts` implements 5-rule priority system (see CONTEXT.md for full rule spec). Signals come from `agent/src/signals/` (FRED, beaconcha.in, DeFiLlama, on-chain APY). Narratives generated via Claude API in `agent/src/narrator/`.

## Frontend Routing

- `/` — root (landing or redirect)
- `/onboard` — 5-step onboarding flow
- `/app` — dashboard (main view)
- `/app/chronicle` — chapter timeline
- `/app/chat` — SAGE chat interface
- `/api/chat` — Claude API proxy (route handler)
