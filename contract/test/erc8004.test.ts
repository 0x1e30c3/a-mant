import { expect } from "chai";
import { ethers } from "hardhat";

// ERC-8004 (Trustless Agents) compliance for the a-MANT registries:
//   - AMANTAgent           = Identity Registry
//   - ReputationRegistry   = Reputation Registry
//   - ValidationRegistry   = Validation Registry
describe("ERC-8004 registries", () => {
  async function deploy() {
    const [deployer, user, client, validator] = await ethers.getSigners();

    const Agent = await ethers.getContractFactory("AMANTAgent");
    const agent = await Agent.deploy();
    await agent.waitForDeployment();

    const Reputation = await ethers.getContractFactory("ReputationRegistry");
    const reputation = await Reputation.deploy(await agent.getAddress());
    await reputation.waitForDeployment();

    const Validation = await ethers.getContractFactory("ValidationRegistry");
    const validation = await Validation.deploy(await agent.getAddress());
    await validation.waitForDeployment();

    return { agent, reputation, validation, deployer, user, client, validator };
  }

  describe("Identity Registry (AMANTAgent)", () => {
    it("registers an agent and exposes the reserved agentWallet metadata", async () => {
      const { agent, user } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");

      const agentId = await agent.getAgentId(user.address);
      expect(agentId).to.equal(1n); // 1-indexed
      expect(await agent.ownerOf(agentId)).to.equal(user.address);
      expect(await agent.getAgentWallet(agentId)).to.equal(user.address);
      expect(await agent.hasAgent(user.address)).to.equal(true);
    });

    it("emits Registered on the standard register(agentURI) entry point and stores the AgentCard URI", async () => {
      const { agent, user } = await deploy();
      const uri = "ipfs://agentcard-axiom";
      await expect(agent.connect(user)["register(string)"](uri))
        .to.emit(agent, "Registered");

      const agentId = await agent.getAgentId(user.address);
      expect(await agent.tokenURI(agentId)).to.equal(uri);
    });

    it("lets the owner set arbitrary metadata but protects the reserved key", async () => {
      const { agent, user } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");
      const agentId = await agent.getAgentId(user.address);

      const value = ethers.toUtf8Bytes("balanced");
      await agent.connect(user).setMetadata(agentId, "riskMode", value);
      expect(await agent.getMetadata(agentId, "riskMode")).to.equal(ethers.hexlify(value));

      await expect(
        agent.connect(user).setMetadata(agentId, "agentWallet", value)
      ).to.be.revertedWith("AMANT: reserved key");
    });

    it("isAuthorizedOrOwner reflects ownership", async () => {
      const { agent, user, client } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");
      const agentId = await agent.getAgentId(user.address);
      expect(await agent.isAuthorizedOrOwner(user.address, agentId)).to.equal(true);
      expect(await agent.isAuthorizedOrOwner(client.address, agentId)).to.equal(false);
    });

    it("is soulbound — transfers revert", async () => {
      const { agent, user, client } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");
      const agentId = await agent.getAgentId(user.address);
      await expect(
        agent.connect(user).transferFrom(user.address, client.address, agentId)
      ).to.be.revertedWith("AMANT: agent is non-transferable");
    });
  });

  describe("Reputation Registry", () => {
    it("accepts client feedback and aggregates a summary", async () => {
      const { agent, reputation, user, client } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");
      const agentId = await agent.getAgentId(user.address);

      const hash = ethers.ZeroHash;
      await expect(
        reputation
          .connect(client)
          .giveFeedback(agentId, 90n, 0, "impact", "REBALANCE", "endpoint", "", hash)
      ).to.emit(reputation, "NewFeedback");

      expect(await reputation.getLastIndex(agentId, client.address)).to.equal(1n);

      const [count, summaryValue, summaryDecimals] = await reputation.getSummary(
        agentId,
        [],
        "",
        ""
      );
      expect(count).to.equal(1n);
      expect(summaryDecimals).to.equal(18);
      expect(summaryValue).to.equal(90n * 10n ** 18n); // normalized from 0 → 18 decimals
    });

    it("blocks self-feedback from the agent owner", async () => {
      const { agent, reputation, user } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");
      const agentId = await agent.getAgentId(user.address);

      await expect(
        reputation
          .connect(user)
          .giveFeedback(agentId, 50n, 0, "impact", "HOLD", "endpoint", "", ethers.ZeroHash)
      ).to.be.revertedWith("Self-feedback not allowed");
    });

    it("supports revoking feedback", async () => {
      const { agent, reputation, user, client } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");
      const agentId = await agent.getAgentId(user.address);

      await reputation
        .connect(client)
        .giveFeedback(agentId, 90n, 0, "impact", "REBALANCE", "endpoint", "", ethers.ZeroHash);
      await reputation.connect(client).revokeFeedback(agentId, 1n);

      const [, , , , isRevoked] = await reputation.readFeedback(agentId, client.address, 1n);
      expect(isRevoked).to.equal(true);

      const [count] = await reputation.getSummary(agentId, [], "", "");
      expect(count).to.equal(0n); // revoked feedback excluded
    });
  });

  describe("Validation Registry", () => {
    it("records a validation request from the owner and a validator response", async () => {
      const { agent, validation, user, validator } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");
      const agentId = await agent.getAgentId(user.address);

      const requestHash = ethers.keccak256(ethers.toUtf8Bytes("decision-1"));
      await expect(
        validation
          .connect(user)
          .validationRequest(validator.address, agentId, "ipfs://request", requestHash)
      ).to.emit(validation, "ValidationRequest");

      await expect(
        validation
          .connect(validator)
          .validationResponse(requestHash, 100, "ipfs://response", ethers.ZeroHash, "REBALANCE")
      ).to.emit(validation, "ValidationResponse");

      const [vAddr, vAgentId, response] = await validation.getValidationStatus(requestHash);
      expect(vAddr).to.equal(validator.address);
      expect(vAgentId).to.equal(agentId);
      expect(response).to.equal(100);

      const [count, avg] = await validation.getSummary(agentId, [], "");
      expect(count).to.equal(1n);
      expect(avg).to.equal(100);
    });

    it("rejects a validation request from a non-owner", async () => {
      const { agent, validation, user, validator, client } = await deploy();
      await agent.createAgent(user.address, "Axiom-1");
      const agentId = await agent.getAgentId(user.address);

      const requestHash = ethers.keccak256(ethers.toUtf8Bytes("decision-2"));
      await expect(
        validation
          .connect(client)
          .validationRequest(validator.address, agentId, "ipfs://request", requestHash)
      ).to.be.revertedWith("Not authorized");
    });
  });
});
