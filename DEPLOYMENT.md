# Deployment — Mantle Sepolia Testnet

**Date:** 2026-06-12
**Chain:** Mantle Sepolia (chainId 5003)
**Deployer:** `0x3a8d93D5F52a26689b075A49E67F4f8924BeC84B`
**Explorer:** https://sepolia.mantle.xyz

---

## Contracts

| Contract | Address |
|---|---|
| AMANTVaultTestnet | [`0xA9163491c71e3b073540cBF84E890fc51195E531`](https://sepolia.mantle.xyz/address/0xA9163491c71e3b073540cBF84E890fc51195E531) |
| AMANTAgent | [`0x8C7b95BA82Fd885650F6348E847E347A3777368A`](https://sepolia.mantle.xyz/address/0x8C7b95BA82Fd885650F6348E847E347A3777368A) |
| AMANTChronicle | [`0x68f2439B56A59Cb21Db4C107bC6413664fb0328E`](https://sepolia.mantle.xyz/address/0x68f2439B56A59Cb21Db4C107bC6413664fb0328E) |

## Mock Tokens

| Token | Address |
|---|---|
| MockUSDY (mUSDY) | [`0xeeb1C3C6d08fd802A292D7B97517F0C41416aF92`](https://sepolia.mantle.xyz/address/0xeeb1C3C6d08fd802A292D7B9757F0C41416aF92) |
| MockmETH (mmETH) | [`0x295e4b7aF572FE8D66f9fa3ae4B9AF1404b3418C`](https://sepolia.mantle.xyz/address/0x295e4b7aF572FE8D66f9fa3ae4B9AF1404b3418C) |

## Wiring

- `vault.setChronicle(chronicle)` ✓
- `agent.setVault(vault)` ✓
- `agent.setAuthorizedLogger(deployer)` ✓
- `chronicle.setAuthorizedWriter(deployer)` ✓

## Environment

```env
NEXT_PUBLIC_CHAIN_ID=5003
NEXT_PUBLIC_VAULT_ADDRESS=0xA9163491c71e3b073540cBF84E890fc51195E531
NEXT_PUBLIC_AGENT_ADDRESS=0x8C7b95BA82Fd885650F6348E847E347A3777368A
NEXT_PUBLIC_CHRONICLE_ADDRESS=0x68f2439B56A59Cb21Db4C107bC6413664fb0328E
NEXT_PUBLIC_USDY_ADDRESS=0xeeb1C3C6d08fd802A292D7B97517F0C41416aF92
NEXT_PUBLIC_METH_ADDRESS=0x295e4b7aF572FE8D66f9fa3ae4B9AF1404b3418C
```

## Faucet

- Mock tokens: click "Get 1000 USDY/mETH" in Deposit modal (auto-mint)
- Testnet MNT: https://faucet.sepolia.mantle.xyz
