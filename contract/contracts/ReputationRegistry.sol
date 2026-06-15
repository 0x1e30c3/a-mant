// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IIdentityRegistry {
    function isAuthorizedOrOwner(address spender, uint256 agentId) external view returns (bool);
}

/**
 * @title ReputationRegistry — ERC-8004 Trustless Agents
 * @notice Lets independent clients publish bounded, tagged feedback signals against an
 *         agent identity. Full feedback payloads live off-chain (feedbackURI + hash);
 *         compact composable signals live on-chain. Agent owners/operators cannot
 *         leave feedback on themselves.
 * @dev Non-upgradeable port of the ERC-8004 reference ReputationRegistry, adapted to
 *      Solidity 0.8.24 / OpenZeppelin v5.2.
 */
contract ReputationRegistry is Ownable {
    int128 private constant MAX_ABS_VALUE = 1e38;

    address public immutable identityRegistry;

    event NewFeedback(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        int128 value,
        uint8 valueDecimals,
        string indexed indexedTag1,
        string tag1,
        string tag2,
        string endpoint,
        string feedbackURI,
        bytes32 feedbackHash
    );

    event FeedbackRevoked(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 indexed feedbackIndex
    );

    event ResponseAppended(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        address indexed responder,
        string responseURI,
        bytes32 responseHash
    );

    struct Feedback {
        int128 value;
        uint8 valueDecimals;
        bool isRevoked;
        string tag1;
        string tag2;
    }

    // agentId => clientAddress => feedbackIndex (1-indexed) => Feedback
    mapping(uint256 => mapping(address => mapping(uint64 => Feedback))) private _feedback;
    // agentId => clientAddress => last feedback index
    mapping(uint256 => mapping(address => uint64)) private _lastIndex;
    // agentId => clients that have left feedback
    mapping(uint256 => address[]) private _clients;
    mapping(uint256 => mapping(address => bool)) private _clientExists;

    constructor(address identityRegistry_) Ownable(msg.sender) {
        require(identityRegistry_ != address(0), "bad identity");
        identityRegistry = identityRegistry_;
    }

    // ─── Feedback ───────────────────────────────────────────────────────────────

    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external {
        require(valueDecimals <= 18, "too many decimals");
        require(value >= -MAX_ABS_VALUE && value <= MAX_ABS_VALUE, "value too large");

        // Reverts if the agent does not exist, and blocks self-feedback from the
        // agent's owner/operators.
        require(
            !IIdentityRegistry(identityRegistry).isAuthorizedOrOwner(msg.sender, agentId),
            "Self-feedback not allowed"
        );

        uint64 currentIndex = ++_lastIndex[agentId][msg.sender];

        _feedback[agentId][msg.sender][currentIndex] = Feedback({
            value: value,
            valueDecimals: valueDecimals,
            isRevoked: false,
            tag1: tag1,
            tag2: tag2
        });

        if (!_clientExists[agentId][msg.sender]) {
            _clients[agentId].push(msg.sender);
            _clientExists[agentId][msg.sender] = true;
        }

        emit NewFeedback(agentId, msg.sender, currentIndex, value, valueDecimals, tag1, tag1, tag2, endpoint, feedbackURI, feedbackHash);
    }

    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external {
        require(feedbackIndex > 0, "index must be > 0");
        require(feedbackIndex <= _lastIndex[agentId][msg.sender], "index out of bounds");
        require(!_feedback[agentId][msg.sender][feedbackIndex].isRevoked, "Already revoked");

        _feedback[agentId][msg.sender][feedbackIndex].isRevoked = true;
        emit FeedbackRevoked(agentId, msg.sender, feedbackIndex);
    }

    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseURI,
        bytes32 responseHash
    ) external {
        require(feedbackIndex > 0, "index must be > 0");
        require(bytes(responseURI).length > 0, "Empty URI");
        require(feedbackIndex <= _lastIndex[agentId][clientAddress], "index out of bounds");

        emit ResponseAppended(agentId, clientAddress, feedbackIndex, msg.sender, responseURI, responseHash);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64) {
        return _lastIndex[agentId][clientAddress];
    }

    function getClients(uint256 agentId) external view returns (address[] memory) {
        return _clients[agentId];
    }

    function readFeedback(uint256 agentId, address clientAddress, uint64 feedbackIndex)
        external
        view
        returns (int128 value, uint8 valueDecimals, string memory tag1, string memory tag2, bool isRevoked)
    {
        require(feedbackIndex > 0, "index must be > 0");
        require(feedbackIndex <= _lastIndex[agentId][clientAddress], "index out of bounds");
        Feedback storage f = _feedback[agentId][clientAddress][feedbackIndex];
        return (f.value, f.valueDecimals, f.tag1, f.tag2, f.isRevoked);
    }

    /**
     * @notice Aggregate non-revoked feedback for an agent.
     * @param clientAddresses optional filter; empty = all clients of the agent.
     * @param tag1 optional filter; empty string = any.
     * @param tag2 optional filter; empty string = any.
     * @return count number of matching feedback entries.
     * @return summaryValue average feedback value, normalized to 18 decimals.
     */
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals) {
        address[] memory clientList;
        if (clientAddresses.length > 0) {
            clientList = clientAddresses;
        } else {
            clientList = _clients[agentId];
        }

        bytes32 tag1Hash = keccak256(bytes(tag1));
        bytes32 tag2Hash = keccak256(bytes(tag2));
        bytes32 emptyHash = keccak256(bytes(""));

        int256 total; // normalized to 18 decimals
        for (uint256 c; c < clientList.length; c++) {
            address client = clientList[c];
            uint64 last = _lastIndex[agentId][client];
            for (uint64 i = 1; i <= last; i++) {
                Feedback storage f = _feedback[agentId][client][i];
                if (f.isRevoked) continue;
                if (tag1Hash != emptyHash && keccak256(bytes(f.tag1)) != tag1Hash) continue;
                if (tag2Hash != emptyHash && keccak256(bytes(f.tag2)) != tag2Hash) continue;

                total += int256(f.value) * int256(10 ** (18 - f.valueDecimals));
                count++;
            }
        }

        summaryValueDecimals = 18;
        summaryValue = count == 0 ? int128(0) : int128(total / int256(uint256(count)));
    }
}
