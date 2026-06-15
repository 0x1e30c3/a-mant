# AGENTS.md

## Repo Structure

pnpm monorepo with 3 packages:
- `web/` — Next.js 15 + React 19 frontend (wagmi, viem, zustand, Tailwind)
- `contract/` — Hardhat Solidity 0.8.24 (OpenZeppelin 5.2)
- `agent/` — Node.js autonomous agent (viem write client, node-cron, LLM via NVIDIA NIM)

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
- **ERC-8004 "Trustless Agents"**: implemented as three registries — `AMANTAgent` (Identity, soulbound + AgentCard URI + metadata), `ReputationRegistry`, `ValidationRegistry`. Compliance tested in `contract/test/erc8004.test.ts`. `AMANTAgent` agentIds are 1-indexed (0 = "no agent"); transfers revert (a-MANT soulbound policy).
- **Solidity**: optimizer enabled, 200 runs, evmVersion `cancun`, **`viaIR: true`** (the registries emit wide events that overflow the stack without it). Keep these when modifying contracts.
- **Web path aliases**: `@/*` maps to `./src/*`.
- **Agent path aliases**: `@/*` maps to `./src/*` (same pattern, different base).

## Environment

- `.env.example` at root defines all vars. Copy to `.env`.
- `NEXT_PUBLIC_*` vars are inlined at build time — changing them requires rebuilding web.
- `PRIVATE_KEY` is used by both contract deploy and agent execution.
- `FRED_API_KEY` — free tier, no billing required. `ALCHEMY_API_KEY` — optional.

## Smart Contracts

In `contract/contracts/`:
- `AMANTVault.sol` — holds USDY + mETH, manages deposits/withdrawals/rebalance, swaps via LI.FI
- `AMANTAgent.sol` — ERC-8004 Identity Registry (soulbound NFT, AgentCard URI, metadata, `isAuthorizedOrOwner`) + a-MANT decision journal & impact reputation
- `ReputationRegistry.sol` — ERC-8004 Reputation Registry (client feedback, self-feedback blocked)
- `ValidationRegistry.sol` — ERC-8004 Validation Registry (validator attestations 0–100)
- `AMANTChronicle.sol` — ERC-721 NFTs for on-chain chapter records
- `AMANTVaultTestnet.sol` + `MockERC20.sol` — testnet-only mocks

## Agent Architecture

Runs on `node-cron` (every 15 min). Decision engine in `agent/src/engine/decision.ts` implements 5-rule priority system (see CONTEXT.md for full rule spec). Signals come from `agent/src/signals/` (FRED, beaconcha.in, DeFiLlama, on-chain APY). Narratives generated via LLM (NVIDIA NIM, meta/llama-3.1-8b-instruct) in `agent/src/narrator/`.

## Frontend Routing

- `/` — root (landing or redirect)
- `/onboard` — 5-step onboarding flow
- `/app` — dashboard (main view)
- `/app/chronicle` — chapter timeline
- `/app/chat` — SAGE chat interface
- `/api/chat` — LLM API proxy (NVIDIA NIM, route handler)
