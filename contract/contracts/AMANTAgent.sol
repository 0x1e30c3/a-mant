// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ERC-8004 inspired: AI Agent with on-chain identity and reputation
contract AMANTAgent is ERC721, Ownable {
    struct Decision {
        string action;       // "REBALANCE", "PROTECT", "COMPOUND", "DISTRIBUTE"
        string context;      // why the decision was made
        string outcome;      // result of the action
        int256 impactAmount; // positive = gain protected/earned, negative = loss prevented
        string signalSource; // which signal triggered this
        uint256 timestamp;
    }

    struct AgentProfile {
        string name;           // e.g. "Axiom-7429"
        uint256 createdAt;
        uint256 totalDecisions;
        uint256 reputationScore; // grows with positive outcomes
        int256 totalImpact;      // cumulative impact in wei
        bool active;
    }

    uint256 private _nextTokenId;

    mapping(address => uint256) public userAgentId;
    mapping(uint256 => Decision[]) public agentDecisions;
    mapping(uint256 => AgentProfile) public agentProfiles;

    address public vault;
    address public authorizedLogger; // backend agent executor

    event AgentBorn(address indexed user, uint256 indexed agentId, string name);
    event DecisionLogged(
        uint256 indexed agentId,
        string action,
        int256 impact,
        string signalSource
    );
    event ReputationUpdated(uint256 indexed agentId, uint256 newScore);

    modifier onlyAuthorized() {
        require(
            msg.sender == authorizedLogger || msg.sender == owner(),
            "AMANT: unauthorized"
        );
        _;
    }

    constructor() ERC721("a-MANT Agent", "AMANT-AI") Ownable(msg.sender) {}

    // ─── Agent Creation ───────────────────────────────────────────────────────

    function createAgent(address user, string calldata agentName) external returns (uint256) {
        require(userAgentId[user] == 0, "AMANT: agent exists");
        require(bytes(agentName).length > 0, "AMANT: empty name");

        uint256 agentId = ++_nextTokenId;
        _safeMint(user, agentId);
        userAgentId[user] = agentId;

        agentProfiles[agentId] = AgentProfile({
            name: agentName,
            createdAt: block.timestamp,
            totalDecisions: 0,
            reputationScore: 0,
            totalImpact: 0,
            active: true
        });

        emit AgentBorn(user, agentId, agentName);
        return agentId;
    }

    // ─── Decision Logging ─────────────────────────────────────────────────────

    function logDecision(
        uint256 agentId,
        string calldata action,
        string calldata context,
        string calldata outcome,
        int256 impactAmount,
        string calldata signalSource
    ) external onlyAuthorized {
        require(_ownerOf(agentId) != address(0), "AMANT: agent not found");

        Decision memory d = Decision({
            action: action,
            context: context,
            outcome: outcome,
            impactAmount: impactAmount,
            signalSource: signalSource,
            timestamp: block.timestamp
        });

        agentDecisions[agentId].push(d);

        AgentProfile storage profile = agentProfiles[agentId];
        profile.totalDecisions++;
        profile.totalImpact += impactAmount;

        // Reputation: positive impact increases score, scaled to avoid overflow
        if (impactAmount > 0) {
            uint256 reputationGain = uint256(impactAmount) / 1e15; // per milli-USD
            profile.reputationScore += reputationGain;
            emit ReputationUpdated(agentId, profile.reputationScore);
        }

        emit DecisionLogged(agentId, action, impactAmount, signalSource);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getDecisions(uint256 agentId) external view returns (Decision[] memory) {
        return agentDecisions[agentId];
    }

    function getDecisionCount(uint256 agentId) external view returns (uint256) {
        return agentDecisions[agentId].length;
    }

    function getProfile(address user) external view returns (AgentProfile memory) {
        return agentProfiles[userAgentId[user]];
    }

    function getAgentId(address user) external view returns (uint256) {
        return userAgentId[user];
    }

    function getReputation(address user) external view returns (uint256) {
        return agentProfiles[userAgentId[user]].reputationScore;
    }

    function hasAgent(address user) external view returns (bool) {
        return userAgentId[user] != 0;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setAuthorizedLogger(address _logger) external onlyOwner {
        authorizedLogger = _logger;
    }

    function setVault(address _vault) external onlyOwner {
        vault = _vault;
    }

    // Non-transferable: AI agent is bound to its guardian
    function transferFrom(address, address, uint256) public pure override {
        revert("AMANT: agent is non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("AMANT: agent is non-transferable");
    }
}
