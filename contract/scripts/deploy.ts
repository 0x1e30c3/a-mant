import { ethers, network } from "hardhat";

// LI.FI Diamond proxy — same address on all EVM chains
// https://docs.li.fi/integrate-li.fi-js-sdk/deploy-li.fi-smart-contracts
const LIFI_DIAMOND = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";

// Mainnet token addresses (used only on mainnet)
const MAINNET_USDY = "0x5bE26527e817998A7206475496fDE1E68957c5A6";
const MAINNET_METH = "0xcDA86A272531e8640cD7F1a92c01839911B90bb0";

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const isTestnet = chainId === 5003n;

  console.log(`\nDeploying a-MANT to ${network.name} (chainId: ${chainId})`);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MNT\n");

  let usdyAddress: string;
  let methAddress: string;

  if (isTestnet) {
    // ── Testnet: deploy mock tokens ──────────────────────────────────────────
    console.log("=== TESTNET MODE: Deploying mock tokens ===\n");

    console.log("1. Deploying MockUSDY...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUsdy = await MockERC20.deploy("Mock USDY", "mUSDY", 18, ethers.parseEther("1000000"));
    await mockUsdy.waitForDeployment();
    usdyAddress = await mockUsdy.getAddress();
    console.log("   ✓ MockUSDY:", usdyAddress);

    console.log("2. Deploying MockmETH...");
    const mockMeth = await MockERC20.deploy("Mock mETH", "mmETH", 18, ethers.parseEther("1000000"));
    await mockMeth.waitForDeployment();
    methAddress = await mockMeth.getAddress();
    console.log("   ✓ MockmETH:", methAddress);

    // Mint some tokens to deployer for testing
    console.log("\n   Minting test tokens to deployer...");
    await mockUsdy.mint(deployer.address, ethers.parseEther("10000"));
    await mockMeth.mint(deployer.address, ethers.parseEther("5"));
    console.log("   ✓ Minted 10,000 mUSDY + 5 mmETH to deployer\n");

    // ── Deploy testnet vault ─────────────────────────────────────────────────
    console.log("3. Deploying AMANTVaultTestnet...");
    const AMANTVaultTestnet = await ethers.getContractFactory("AMANTVaultTestnet");
    const vault = await AMANTVaultTestnet.deploy(deployer.address, usdyAddress, methAddress);
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log("   ✓ AMANTVaultTestnet:", vaultAddress);

    // ── Deploy Agent ─────────────────────────────────────────────────────────
    console.log("4. Deploying AMANTAgent...");
    const AMANTAgent = await ethers.getContractFactory("AMANTAgent");
    const agent = await AMANTAgent.deploy();
    await agent.waitForDeployment();
    const agentAddress = await agent.getAddress();
    console.log("   ✓ AMANTAgent:", agentAddress);

    // ── Deploy Chronicle ─────────────────────────────────────────────────────
    console.log("5. Deploying AMANTChronicle...");
    const AMANTChronicle = await ethers.getContractFactory("AMANTChronicle");
    const chronicle = await AMANTChronicle.deploy();
    await chronicle.waitForDeployment();
    const chronicleAddress = await chronicle.getAddress();
    console.log("   ✓ AMANTChronicle:", chronicleAddress);

    // ── Deploy ERC-8004 Reputation + Validation registries ─────────────────────
    console.log("6. Deploying ReputationRegistry (ERC-8004)...");
    const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    const reputation = await ReputationRegistry.deploy(agentAddress);
    await reputation.waitForDeployment();
    const reputationAddress = await reputation.getAddress();
    console.log("   ✓ ReputationRegistry:", reputationAddress);

    console.log("7. Deploying ValidationRegistry (ERC-8004)...");
    const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
    const validation = await ValidationRegistry.deploy(agentAddress);
    await validation.waitForDeployment();
    const validationAddress = await validation.getAddress();
    console.log("   ✓ ValidationRegistry:", validationAddress);

    // ── Wire contracts ───────────────────────────────────────────────────────
    console.log("\n8. Wiring contracts...");
    await vault.setChronicle(chronicleAddress);
    console.log("   vault.setChronicle ✓");
    await agent.setVault(vaultAddress);
    console.log("   agent.setVault ✓");
    await agent.setAuthorizedLogger(deployer.address);
    console.log("   agent.setAuthorizedLogger (deployer) ✓");
    await chronicle.setAuthorizedWriter(deployer.address);
    console.log("   chronicle.setAuthorizedWriter (deployer) ✓");
    await chronicle.setWriter(vaultAddress, true);
    console.log("   chronicle.setWriter (vault → genesis chapter) ✓");

    // ── Print env vars ───────────────────────────────────────────────────────
    console.log("\n─── Copy to .env ────────────────────────────────────");
    console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`);
    console.log(`NEXT_PUBLIC_AGENT_ADDRESS=${agentAddress}`);
    console.log(`NEXT_PUBLIC_CHRONICLE_ADDRESS=${chronicleAddress}`);
    console.log(`NEXT_PUBLIC_REPUTATION_ADDRESS=${reputationAddress}`);
    console.log(`NEXT_PUBLIC_VALIDATION_ADDRESS=${validationAddress}`);
    console.log(`NEXT_PUBLIC_USDY_ADDRESS=${usdyAddress}`);
    console.log(`NEXT_PUBLIC_METH_ADDRESS=${methAddress}`);
    console.log(`NEXT_PUBLIC_CHAIN_ID=5003`);
    console.log("─────────────────────────────────────────────────────");
  } else {
    // ── Mainnet: use real token addresses ────────────────────────────────────
    usdyAddress = MAINNET_USDY;
    methAddress = MAINNET_METH;

    console.log("=== MAINNET MODE ===\n");

    // ── 1. AMANTAgent ──────────────────────────────────────────────────────
    console.log("1. Deploying AMANTAgent...");
    const AMANTAgent = await ethers.getContractFactory("AMANTAgent");
    const agent = await AMANTAgent.deploy();
    await agent.waitForDeployment();
    const agentAddress = await agent.getAddress();
    console.log("   ✓ AMANTAgent:", agentAddress);

    // ── 2. AMANTVault ──────────────────────────────────────────────────────
    console.log("2. Deploying AMANTVault...");
    const AMANTVault = await ethers.getContractFactory("AMANTVault");
    const vault = await AMANTVault.deploy(deployer.address);
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log("   ✓ AMANTVault:", vaultAddress);

    // ── 3. AMANTChronicle ─────────────────────────────────────────────────
    console.log("3. Deploying AMANTChronicle...");
    const AMANTChronicle = await ethers.getContractFactory("AMANTChronicle");
    const chronicle = await AMANTChronicle.deploy();
    await chronicle.waitForDeployment();
    const chronicleAddress = await chronicle.getAddress();
    console.log("   ✓ AMANTChronicle:", chronicleAddress);

    // ── 3b. ERC-8004 Reputation + Validation registries ────────────────────
    console.log("3b. Deploying ReputationRegistry (ERC-8004)...");
    const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    const reputation = await ReputationRegistry.deploy(agentAddress);
    await reputation.waitForDeployment();
    const reputationAddress = await reputation.getAddress();
    console.log("   ✓ ReputationRegistry:", reputationAddress);

    console.log("3c. Deploying ValidationRegistry (ERC-8004)...");
    const ValidationRegistry = await ethers.getContractFactory("ValidationRegistry");
    const validation = await ValidationRegistry.deploy(agentAddress);
    await validation.waitForDeployment();
    const validationAddress = await validation.getAddress();
    console.log("   ✓ ValidationRegistry:", validationAddress);

    // ── 4. Wire contracts ──────────────────────────────────────────────────
    console.log("\n4. Wiring contracts...");
    await vault.setChronicle(chronicleAddress);
    console.log("   vault.setChronicle ✓");
    await agent.setVault(vaultAddress);
    console.log("   agent.setVault ✓");
    await agent.setAuthorizedLogger(deployer.address);
    console.log("   agent.setAuthorizedLogger (deployer) ✓");
    await chronicle.setAuthorizedWriter(deployer.address);
    console.log("   chronicle.setAuthorizedWriter (deployer) ✓");
    await chronicle.setWriter(vaultAddress, true);
    console.log("   chronicle.setWriter (vault → genesis chapter) ✓");

    // ── 5. Configure LI.FI ────────────────────────────────────────────────
    console.log("\n5. Configuring LI.FI integration...");
    await vault.setLifiDiamond(LIFI_DIAMOND);
    console.log(`   vault.setLifiDiamond(${LIFI_DIAMOND}) ✓`);

    // ── 6. Print env vars ─────────────────────────────────────────────────
    console.log("\n─── Copy to .env ────────────────────────────────────");
    console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`);
    console.log(`NEXT_PUBLIC_AGENT_ADDRESS=${agentAddress}`);
    console.log(`NEXT_PUBLIC_CHRONICLE_ADDRESS=${chronicleAddress}`);
    console.log(`NEXT_PUBLIC_REPUTATION_ADDRESS=${reputationAddress}`);
    console.log(`NEXT_PUBLIC_VALIDATION_ADDRESS=${validationAddress}`);
    console.log("─────────────────────────────────────────────────────");
    console.log("\nAlso add to agent .env:");
    console.log(`VAULT_ADDRESS=${vaultAddress}`);
    console.log(`AGENT_ADDRESS=${agentAddress}`);
    console.log(`CHRONICLE_ADDRESS=${chronicleAddress}`);
    console.log(`REPUTATION_ADDRESS=${reputationAddress}`);
    console.log(`VALIDATION_ADDRESS=${validationAddress}`);
    console.log("─────────────────────────────────────────────────────");
  }

  console.log("\nDone.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
