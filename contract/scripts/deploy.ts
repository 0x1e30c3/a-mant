import { ethers, network } from "hardhat";

// LI.FI Diamond proxy — same address on all EVM chains
// https://docs.li.fi/integrate-li.fi-js-sdk/deploy-li.fi-smart-contracts
const LIFI_DIAMOND = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log(`\nDeploying a-MANT to ${network.name} (chainId: ${chainId})`);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MNT\n");

  // ── 1. AMANTAgent ──────────────────────────────────────────────────────────
  console.log("1. Deploying AMANTAgent...");
  const AMANTAgent = await ethers.getContractFactory("AMANTAgent");
  const agent = await AMANTAgent.deploy();
  await agent.waitForDeployment();
  const agentAddress = await agent.getAddress();
  console.log("   ✓ AMANTAgent:", agentAddress);

  // ── 2. AMANTVault ──────────────────────────────────────────────────────────
  console.log("2. Deploying AMANTVault...");
  const AMANTVault = await ethers.getContractFactory("AMANTVault");
  const vault = await AMANTVault.deploy(deployer.address);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("   ✓ AMANTVault:", vaultAddress);

  // ── 3. AMANTChronicle ─────────────────────────────────────────────────────
  console.log("3. Deploying AMANTChronicle...");
  const AMANTChronicle = await ethers.getContractFactory("AMANTChronicle");
  const chronicle = await AMANTChronicle.deploy();
  await chronicle.waitForDeployment();
  const chronicleAddress = await chronicle.getAddress();
  console.log("   ✓ AMANTChronicle:", chronicleAddress);

  // ── 4. Wire contracts ──────────────────────────────────────────────────────
  console.log("\n4. Wiring contracts...");

  await vault.setChronicle(chronicleAddress);
  console.log("   vault.setChronicle ✓");

  await agent.setVault(vaultAddress);
  console.log("   agent.setVault ✓");

  // Set deployer as authorized logger for now — update to agent executor wallet after
  await agent.setAuthorizedLogger(deployer.address);
  console.log("   agent.setAuthorizedLogger (deployer) ✓");

  await chronicle.setAuthorizedWriter(deployer.address);
  console.log("   chronicle.setAuthorizedWriter (deployer) ✓");

  // ── 5. Configure LI.FI ────────────────────────────────────────────────────
  console.log("\n5. Configuring LI.FI integration...");
  await vault.setLifiDiamond(LIFI_DIAMOND);
  console.log(`   vault.setLifiDiamond(${LIFI_DIAMOND}) ✓`);

  // ── 6. Print env vars ─────────────────────────────────────────────────────
  console.log("\n─── Copy to .env ────────────────────────────────────");
  console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`NEXT_PUBLIC_AGENT_ADDRESS=${agentAddress}`);
  console.log(`NEXT_PUBLIC_CHRONICLE_ADDRESS=${chronicleAddress}`);
  console.log("─────────────────────────────────────────────────────");
  console.log("\nAlso add to agent .env:");
  console.log(`VAULT_ADDRESS=${vaultAddress}`);
  console.log(`AGENT_ADDRESS=${agentAddress}`);
  console.log(`CHRONICLE_ADDRESS=${chronicleAddress}`);
  console.log("─────────────────────────────────────────────────────");

  console.log("\nDone. Update AGENT_ADDRESS on vault if using a separate agent wallet:");
  console.log(`  vault.setAgentExecutor(<agent-wallet>)`);
  console.log(`  agent.setAuthorizedLogger(<agent-wallet>)`);
  console.log(`  chronicle.setAuthorizedWriter(<agent-wallet>)`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
