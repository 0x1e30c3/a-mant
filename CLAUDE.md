# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

a-MANT is an **autonomous AI savings vault on Mantle L2** (hackathon project). The AI agent executes real on-chain rebalancing transactions on its own — the web app and chat (SAGE) are read-only windows into what the AI has already done, not a wallet chatbot. Keep this framing when touching UX: AI acts, the user observes.

See `README.md` for the product narrative and `CONTEXT.md` for the full decision-rule spec. `AGENTS.md` has additional quirks.

## Monorepo layout

pnpm workspace (`pnpm@9`, Node 20+) with three **independent** packages — no shared code except contract ABIs generated into `contract/artifacts/`:

- `web/` — Next.js 15 + React 19 frontend (wagmi v2, viem, zustand, Tailwind). Path alias `@/*` → `web/src/*`.
- `contract/` — Hardhat, Solidity 0.8.24, OpenZeppelin v5.2.
- `agent/` — Node.js autonomous agent (viem write client + node-cron). Path alias `@/*` → `agent/src/*`.

## Commands (run from repo root)

```bash
pnpm install              # install all packages (must run from root)
pnpm dev:web              # Next.js dev server → localhost:3000
pnpm dev:agent            # agent via `tsx watch` (one cron-driven process)
pnpm build:web            # next build — use this to VERIFY web changes
pnpm build:contract       # hardhat compile → contract/artifacts/
pnpm test:contract        # hardhat test (NO tests exist yet)
pnpm deploy:contract      # deploy to Mantle MAINNET (network: mantle)
```

Commands only available inside a package (the root has no alias for them):
```bash
pnpm --filter web lint                 # next lint
pnpm --filter contract deploy:testnet  # deploy to Mantle Sepolia (network: mantleTestnet)
```

Verification, since there is no root typecheck/lint:
- **Web**: `pnpm build:web` (or `pnpm --filter web lint`).
- **Agent**: `cd agent && npx tsc --noEmit` (or `pnpm --filter agent build`).
- **Contracts**: `pnpm build:contract`.

> Note: README references `pnpm deploy:testnet` / `pnpm deploy:mainnet` at the root — those aliases do **not** exist. Use the actual commands above.

## Environment

- All vars are defined in root `.env.example`; copy to root `.env`.
- Hardhat loads `.env` from **repo root** (`../.env`), not `contract/.env`.
- The agent needs its own copy: `cp ../.env agent/.env` before running locally.
- `PRIVATE_KEY` is used by **both** contract deploy and agent execution.
- `NEXT_PUBLIC_*` vars (contract addresses) are inlined at build time — changing them requires rebuilding web.

## Smart contracts (`contract/contracts/`)

- `AMANTVault.sol` — holds USDY + mETH, handles deposit / withdraw / rebalance, swaps via LI.FI.
- `AMANTAgent.sol` — **ERC-8004 Identity Registry**: ERC-721 agent identity with AgentCard `tokenURI`, arbitrary key→value metadata (reserved `agentWallet`), and the `isAuthorizedOrOwner` hook the other registries use. Layered on top: a-MANT's decision journal + impact reputation. Soulbound (transfers revert) and 1-indexed agentIds (0 = "no agent") are a-MANT policy choices.
- `ReputationRegistry.sol` — **ERC-8004 Reputation Registry**: clients publish bounded, tagged feedback; agent owner/operators can't self-rate.
- `ValidationRegistry.sol` — **ERC-8004 Validation Registry**: owner opens a request, a validator responds with a 0–100 score.
- `AMANTChronicle.sol` — ERC-721 milestone NFTs ("chapters").
- `AMANTVaultTestnet.sol` + `MockERC20.sol` — testnet-only (deploy uses these when chainId 5003).

ERC-8004 compliance is verified by `contract/test/erc8004.test.ts` (`pnpm test:contract`). These are non-upgradeable ports of the official ERC-8004 reference (which is UUPS/ERC-7201) adapted to this repo's OZ v5.2 / Solidity 0.8.24 stack.

`scripts/deploy.ts` deploys all registries (Reputation + Validation point at `AMANTAgent` as the identity registry) and wires contracts together (`vault.setChronicle`, `agent.setVault`, `agent.setAuthorizedLogger`, `chronicle.setAuthorizedWriter`, mainnet also `vault.setLifiDiamond`). It branches on chainId: 5003 → testnet (mock tokens + `AMANTVaultTestnet`), else mainnet (real tokens + `AMANTVault`).

Solidity compiler settings are intentional: optimizer on, **200 runs, evmVersion `cancun`, `viaIR: true`** (the registries' wide events overflow the stack without viaIR). Preserve these when editing contracts.

## Agent architecture (`agent/src/`)

`index.ts` runs a `node-cron` job (every 15 min) per monitored user:

1. `signals/macro.ts` + `signals/onchain.ts` — pull Fed rate (FRED), ETH staking (beaconcha.in), Ondo/DeFi health (DeFiLlama), volatility (alternative.me Fear & Greed), and on-chain APY.
2. `engine/decision.ts` — 5-priority rule system; acts only when confidence > 70%, otherwise HOLD. Full rule order is in `README.md` / `CONTEXT.md`.
3. `executor/index.ts` — viem write client; submits the rebalance/protect tx on-chain.
4. `narrator/index.ts` — LLM turns the decision into a Chronicle chapter narrative.

## Frontend routing (`web/src/app/`)

- `/` — landing / onboarding entry
- `/onboard` — 5-step onboarding (goal → duration → risk mode → connect wallet → activate)
- `/app` — dashboard (leads with one number: portfolio value + goal progress)
- `/app/chronicle` — chapter timeline
- `/app/chat` — SAGE chat
- `/api/chat` — LLM API proxy (route handler)

Read hooks live in `web/src/hooks/` (`useVault`, `useAgent` — wagmi reads). Onboarding state is in `web/src/store/` (zustand).

## Conventions

- **LLM usage** (narrator + chat) is **NVIDIA NIM**, model `meta/llama-3.1-8b-instruct`, via `NVIDIA_API_KEY` — base URL `https://integrate.api.nvidia.com/v1`. Note: landing-page branding previously said "Claude AI"; the code has never used Anthropic. Labels now say generic "LLM".
- **UI design**: dark/premium/minimal — bg `#0a0a0f`, accent `#ffefc5`, Manrope font, no emoji, no decorative gradients. No DeFi jargon ("rebalance", "yield", "APY") in primary UI — only in detail layers.
- Mantle chain IDs: 5000 (mainnet), 5003 (testnet).
- There are **no automated tests** for contracts or agent — do not rely on a test suite to catch regressions; verify via the build commands above.
