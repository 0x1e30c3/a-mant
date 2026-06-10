# a-MANT — Next Plan

Hackathon deadline: **June 15, 2026**

---

## Status

### Done
- [x] Monorepo scaffold (web, contract, agent)
- [x] Three Solidity contracts: AMANTVault, AMANTAgent, AMANTChronicle
- [x] Hardhat config for Mantle mainnet + testnet (EVM: cancun)
- [x] Agent signal fetchers: FRED, beaconcha.in, DeFiLlama, Fear & Greed
- [x] Decision engine (5-rule priority system)
- [x] Executor: viem write client calling contracts on-chain
- [x] Narrator: Claude API → chapter text generation
- [x] Agent cron loop (every 15 min), multi-user
- [x] Web onboarding flow (5 steps, framer-motion transitions)
- [x] Dashboard page (total value, allocation, AI status, latest chapter)
- [x] Chronicle page (chapter timeline, color-coded by type)
- [x] Chat page (SAGE interface, Claude API route)
- [x] Wagmi v2 config for Mantle chains
- [x] Contract ABIs with correct tuple encoding
- [x] All UI in English
- [x] TypeScript target ES2020, contracts compile clean
- [x] Pushed to GitHub

---

## Critical Path (Must Ship Before June 15)

### 1. Contract Deployment to Mantle Testnet
**Priority: BLOCKER**

Nothing works end-to-end without deployed contracts.

```bash
# Fund deployer wallet at https://faucet.sepolia.mantle.xyz
pnpm deploy:testnet
# Then copy addresses to .env
```

After deploy:
- Update `.env` with `NEXT_PUBLIC_VAULT_ADDRESS`, `NEXT_PUBLIC_AGENT_ADDRESS`, `NEXT_PUBLIC_CHRONICLE_ADDRESS`
- Test each contract function manually via Hardhat console or script

---

### 2. Deposit Flow (Missing from UI)
**Priority: HIGH**

The dashboard shows "Deposit" button but there is no deposit flow. A user cannot actually put money in. This needs:

#### A. Token Approval Modal
File to create: `web/src/components/DepositModal.tsx`

Steps:
1. User selects token (USDY or mETH) and amount
2. Check current allowance via `ERC20.allowance(user, VAULT_ADDRESS)`
3. If insufficient → call `ERC20.approve(VAULT_ADDRESS, amount)`, wait for tx
4. Then call `AMANTVault.deposit(token, amount)`, wait for tx
5. Show success state, refresh position

```typescript
// Hooks needed in web/src/hooks/useDeposit.ts
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

export function useApprove(token: `0x${string}`) { ... }
export function useDeposit() { ... }
```

#### B. Wire Deposit into Dashboard
Replace the "Deposit" button on `/app/page.tsx` with modal trigger.

---

### 3. Onboarding → On-Chain Actions
**Priority: HIGH**

The onboarding flow currently only stores state locally. The "Activate Axiom" step needs to:

1. Call `AMANTAgent.createAgent(userAddress, "Axiom")` — mints soulbound NFT
2. Call `AMANTVault.setGoal(goalAmount, durationDays, riskMode)` — stores goal on-chain
3. Then redirect to deposit flow

File to update: `web/src/app/page.tsx` → `ActivateStep` component

```typescript
// In ActivateStep:
const { writeContract } = useWriteContract();

// 1. Create agent NFT
writeContract({
  address: ADDRESSES.AGENT,
  abi: AGENT_ABI,
  functionName: "createAgent",
  args: [address, "Axiom"],
});

// 2. Set goal
writeContract({
  address: ADDRESSES.VAULT,
  abi: VAULT_ABI,
  functionName: "setGoal",
  args: [parseUnits(data.goalAmount, 18), BigInt(data.durationMonths * 30), data.riskMode],
});
```

---

### 4. Wrong Network Detection
**Priority: MEDIUM**

If user is on Ethereum mainnet instead of Mantle, all contract calls fail silently.

Add a network guard component: `web/src/components/NetworkGuard.tsx`

```typescript
import { useChainId, useSwitchChain } from "wagmi";

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  if (chainId !== 5003 && chainId !== 5000) {
    return (
      <div className="fixed inset-0 ...">
        <p>Switch to Mantle network</p>
        <Button onClick={() => switchChain({ chainId: 5003 })}>Switch to Mantle Testnet</Button>
      </div>
    );
  }
  return children;
}
```

Wrap in `web/src/app/app/layout.tsx`.

---

### 5. Agent Server Setup
**Priority: MEDIUM**

The agent needs to run on a server (not locally) to actually execute autonomously during the hackathon demo.

Options:
- **Railway** (free tier, easiest): `railway up` from `/agent`
- **Fly.io**: `fly deploy`
- **VPS**: run with `pm2 start pnpm -- start`

Agent `.env` needs:
```
PRIVATE_KEY=0x...           # Agent wallet (separate from user wallet)
ANTHROPIC_API_KEY=sk-ant-...
FRED_API_KEY=...
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_AGENT_ADDRESS=0x...
NEXT_PUBLIC_CHRONICLE_ADDRESS=0x...
MONITORED_USERS=0xDEMO_WALLET_ADDRESS
```

Fund the agent wallet with testnet MNT for gas.

---

### 6. Vercel Deployment
**Priority: MEDIUM**

```bash
cd web
vercel --prod
```

Set environment variables in Vercel dashboard (same as `.env`).

Production URL goes into hackathon submission.

---

## Nice-to-Have (If Time Permits)

### Withdraw Flow
- Same pattern as deposit — modal → write `AMANTVault.withdraw(token, amount)`

### Transaction Toast Notifications
- Install `sonner` (already in deps) and wire up tx confirmation toasts
- "Axiom rebalanced your portfolio" → toast notification

### Rebalance History on Dashboard
- Under AI status card, show last 3 rebalance events from `getRebalanceHistory`
- Date, direction (USDY→mETH), amount, reason

### Milestone NFT Display
- When Chronicle `chapterType === 2` (MILESTONE), show NFT badge in Chronicle timeline
- Link to NFT on Mantle explorer

### APY Live Data
- Replace hardcoded `~4.5%` on dashboard with live read from Aave Pool
- Already implemented in `agent/src/signals/onchain.ts`, expose via API route

---

## Hackathon Submission Checklist

- [ ] Contracts deployed to Mantle testnet
- [ ] Web app live on Vercel (or similar)
- [ ] Agent running autonomously on server
- [ ] At least one full demo cycle (deposit → AI decides → chapter written)
- [ ] Demo video (3-5 min): show onboarding, AI taking action, chronicle updating
- [ ] DoraHacks submission form filled (project description, track, repo, demo URL)
- [ ] Team info added to submission

---

## Demo Script (for Judges)

1. Open app → onboarding: "I want to save $500 for 6 months, Balanced risk"
2. Connect MetaMask on Mantle Testnet
3. Activate Axiom → soulbound NFT minted on-chain
4. Deposit 500 USDY
5. Show Chronicle — "The First Deposit" chapter appears
6. Manually trigger one agent cycle (or show it auto-running)
7. Agent detects APY differential → rebalances 35% to mETH
8. Chronicle updates: "A Calculated Move" chapter
9. Open Chat → ask "Why did you move my funds?"
10. Axiom explains: "ETH staking yield was 1.8% higher than USDY at the time..."
11. Show agent's reputation score increased

**Key message to judges**: This is not a chatbot. It is an autonomous agent that already acted before you opened the app.

---

## Architecture Decision Notes

### Why two tokens (USDY + mETH)?
Gives the AI a real decision to make — RWA stablecoin vs LST. Different risk profiles, different yield curves, different macro sensitivity. This is the core of the AI x RWA track.

### Why not use Aave/Agni directly?
For the hackathon, the vault holds tokens directly. The AI simulates "rebalancing" by updating internal allocation tracking. Real protocol integration (depositing into Aave yield strategies) is the V2 feature.

### Why soulbound agent NFT?
ERC-8004 is Mantle's AI agent identity standard. Using it signals track alignment. The non-transferable NFT means the AI agent is permanently bound to one user — it's *your* AI, not a shared protocol.

### Why narrative chapters instead of a dashboard table?
Numbers don't create emotional investment. A story does. "Your AI shifted $180 to safer ground because treasury yields dipped" is more memorable than a table row. This is the UX differentiator vs every other DeFi dashboard.
