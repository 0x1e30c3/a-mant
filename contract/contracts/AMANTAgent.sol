// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AMANTAgent — ERC-8004 Identity Registry (a-MANT profile)
 * @notice Implements the ERC-8004 "Trustless Agents" Identity Registry: agents are
 *         ERC-721 tokens whose `tokenURI` resolves to an off-chain AgentCard, with an
 *         arbitrary on-chain key→value metadata store (including the reserved
 *         `agentWallet` key) and the `isAuthorizedOrOwner` hook the Reputation and
 *         Validation registries rely on.
 *
 * @dev a-MANT extensions on top of the standard:
 *      - Soulbound: an agent is bound to its guardian (transfers revert). This is a
 *        deliberate a-MANT policy; ERC-8004 itself leaves transferability to the impl.
 *      - One agent per guardian (`userAgentId`), 1-indexed so `0` means "no agent".
 *      - An on-chain decision journal + impact-weighted reputation used by the a-MANT UI,
 *        complementing the standalone ERC-8004 ReputationRegistry.
 */
contract AMANTAgent is ERC721URIStorage, Ownable {
    // ─── ERC-8004 Identity Registry ────────────────────────────────────────────

    struct MetadataEntry {
        string metadataKey;
        bytes metadataValue;
    }

    // agentId => metadataKey => metadataValue (includes the reserved "agentWallet")
    mapping(uint256 => mapping(string => bytes)) private _metadata;
    bytes32 private constant RESERVED_AGENT_WALLET_KEY_HASH = keccak256("agentWallet");

    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);
    event MetadataSet(uint256 indexed agentId, string indexed indexedMetadataKey, string metadataKey, bytes metadataValue);
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);

    // ─── a-MANT domain layer ───────────────────────────────────────────────────

    struct Decision {
        string action;       // "REBALANCE", "PROTECT", "COMPOUND", "DISTRIBUTE"
        string context;      // why the decision was made
        string outcome;      // result of the action
        int256 impactAmount; // positive = gain protected/earned, negative = loss prevented
        string signalSource; // which signal triggered this
        uint256 timestamp;
    }

    struct AgentProfile {
        string name;             // e.g. "Axiom-7429"
        uint256 createdAt;
        uint256 totalDecisions;
        uint256 reputationScore; // grows with positive outcomes
        int256 totalImpact;      // cumulative impact in wei
        bool active;
    }

    uint256 private _nextTokenId; // 1-indexed agentIds

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

    // ─── ERC-8004: registration ─────────────────────────────────────────────────

    /// @notice Register the caller as an agent with no AgentCard URI yet.
    function register() external returns (uint256 agentId) {
        return _register(msg.sender, "", "");
    }

    /// @notice Register the caller as an agent pointing to an AgentCard `agentURI`.
    function register(string calldata agentURI) external returns (uint256 agentId) {
        return _register(msg.sender, agentURI, "");
    }

    /// @notice Register the caller as an agent with an AgentCard URI and initial metadata.
    function register(string calldata agentURI, MetadataEntry[] calldata metadata)
        external
        returns (uint256 agentId)
    {
        agentId = _register(msg.sender, agentURI, "");
        for (uint256 i; i < metadata.length; i++) {
            require(
                keccak256(bytes(metadata[i].metadataKey)) != RESERVED_AGENT_WALLET_KEY_HASH,
                "AMANT: reserved key"
            );
            _metadata[agentId][metadata[i].metadataKey] = metadata[i].metadataValue;
            emit MetadataSet(agentId, metadata[i].metadataKey, metadata[i].metadataKey, metadata[i].metadataValue);
        }
    }

    /**
     * @notice a-MANT convenience: register an agent owned by `user` with a display name.
     * @dev Backward-compatible entry point used by the app/executor.
     */
    function createAgent(address user, string calldata agentName) external returns (uint256 agentId) {
        require(bytes(agentName).length > 0, "AMANT: empty name");
        agentId = _register(user, "", agentName);
        emit AgentBorn(user, agentId, agentName);
    }

    function _register(address to, string memory agentURI, string memory name)
        private
        returns (uint256 agentId)
    {
        require(userAgentId[to] == 0, "AMANT: agent exists");

        agentId = ++_nextTokenId;
        userAgentId[to] = agentId;
        _safeMint(to, agentId);
        if (bytes(agentURI).length > 0) {
            _setTokenURI(agentId, agentURI);
        }

        // Reserved metadata key set on registration (ERC-8004).
        _metadata[agentId]["agentWallet"] = abi.encodePacked(to);

        agentProfiles[agentId] = AgentProfile({
            name: name,
            createdAt: block.timestamp,
            totalDecisions: 0,
            reputationScore: 0,
            totalImpact: 0,
            active: true
        });

        emit Registered(agentId, agentURI, to);
        emit MetadataSet(agentId, "agentWallet", "agentWallet", abi.encodePacked(to));
    }

    // ─── ERC-8004: metadata & AgentCard URI ─────────────────────────────────────

    function getMetadata(uint256 agentId, string calldata metadataKey) external view returns (bytes memory) {
        return _metadata[agentId][metadataKey];
    }

    function setMetadata(uint256 agentId, string calldata metadataKey, bytes calldata metadataValue) external {
        require(isAuthorizedOrOwner(msg.sender, agentId), "AMANT: not authorized");
        require(keccak256(bytes(metadataKey)) != RESERVED_AGENT_WALLET_KEY_HASH, "AMANT: reserved key");
        _metadata[agentId][metadataKey] = metadataValue;
        emit MetadataSet(agentId, metadataKey, metadataKey, metadataValue);
    }

    function setAgentURI(uint256 agentId, string calldata newURI) external {
        require(isAuthorizedOrOwner(msg.sender, agentId), "AMANT: not authorized");
        _setTokenURI(agentId, newURI);
        emit URIUpdated(agentId, newURI, msg.sender);
    }

    function getAgentWallet(uint256 agentId) external view returns (address) {
        bytes memory walletData = _metadata[agentId]["agentWallet"];
        if (walletData.length < 20) return address(0);
        return address(bytes20(walletData));
    }

    /// @notice Owner/operator updates the agent's execution wallet (reserved metadata).
    function setAgentWallet(uint256 agentId, address newWallet) external {
        require(isAuthorizedOrOwner(msg.sender, agentId), "AMANT: not authorized");
        require(newWallet != address(0), "AMANT: bad wallet");
        _metadata[agentId]["agentWallet"] = abi.encodePacked(newWallet);
        emit MetadataSet(agentId, "agentWallet", "agentWallet", abi.encodePacked(newWallet));
    }

    /**
     * @notice ERC-8004 authorization hook used by the Reputation/Validation registries.
     * @dev Reverts (ERC721NonexistentToken) if the agent does not exist.
     */
    function isAuthorizedOrOwner(address spender, uint256 agentId) public view returns (bool) {
        address agentOwner = ownerOf(agentId); // reverts if nonexistent
        return
            spender == agentOwner ||
            isApprovedForAll(agentOwner, spender) ||
            getApproved(agentId) == spender;
    }

    // ─── a-MANT: decision journal ───────────────────────────────────────────────

    function logDecision(
        uint256 agentId,
        string calldata action,
        string calldata context,
        string calldata outcome,
        int256 impactAmount,
        string calldata signalSource
    ) external onlyAuthorized {
        require(_ownerOf(agentId) != address(0), "AMANT: agent not found");

        agentDecisions[agentId].push(Decision({
            action: action,
            context: context,
            outcome: outcome,
            impactAmount: impactAmount,
            signalSource: signalSource,
            timestamp: block.timestamp
        }));

        AgentProfile storage profile = agentProfiles[agentId];
        profile.totalDecisions++;
        profile.totalImpact += impactAmount;

        // Reputation: positive impact increases score, scaled to avoid overflow.
        if (impactAmount > 0) {
            uint256 reputationGain = uint256(impactAmount) / 1e15; // per milli-USD
            profile.reputationScore += reputationGain;
            emit ReputationUpdated(agentId, profile.reputationScore);
        }

        emit DecisionLogged(agentId, action, impactAmount, signalSource);
    }

    // ─── Views ──────────────────────────────────────────────────────────────────

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

    // ─── Soulbound (a-MANT policy) ──────────────────────────────────────────────

    /// @dev Block transfers (allow mint/burn). The agent is bound to its guardian.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "AMANT: agent is non-transferable");
        return super._update(to, tokenId, auth);
    }
}
