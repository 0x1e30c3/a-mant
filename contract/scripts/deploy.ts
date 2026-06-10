import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MNT");

  // 1. Deploy AMANTAgent
  console.log("\n1. Deploying AMANTAgent...");
  const AMANTAgent = await ethers.getContractFactory("AMANTAgent");
  const agent = await AMANTAgent.deploy();
  await agent.waitForDeployment();
  const agentAddress = await agent.getAddress();
  console.log("   AMANTAgent:", agentAddress);

  // 2. Deploy AMANTVault (agent executor = deployer for now, update after)
  console.log("2. Deploying AMANTVault...");
  const AMANTVault = await ethers.getContractFactory("AMANTVault");
  const vault = await AMANTVault.deploy(deployer.address);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("   AMANTVault:", vaultAddress);

  // 3. Deploy AMANTChronicle
  console.log("3. Deploying AMANTChronicle...");
  const AMANTChronicle = await ethers.getContractFactory("AMANTChronicle");
  const chronicle = await AMANTChronicle.deploy();
  await chronicle.waitForDeployment();
  const chronicleAddress = await chronicle.getAddress();
  console.log("   AMANTChronicle:", chronicleAddress);

  // 4. Wire contracts together
  console.log("\n4. Wiring contracts...");
  await vault.setChronicle(chronicleAddress);
  await agent.setVault(vaultAddress);
  await agent.setAuthorizedLogger(deployer.address); // update to agent executor later
  await chronicle.setAuthorizedWriter(deployer.address); // update to agent executor later
  console.log("   Done.");

  // 5. Print env vars
  console.log("\n─── Add to .env ────────────────────────────────────");
  console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`NEXT_PUBLIC_AGENT_ADDRESS=${agentAddress}`);
  console.log(`NEXT_PUBLIC_CHRONICLE_ADDRESS=${chronicleAddress}`);
  console.log("────────────────────────────────────────────────────");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
