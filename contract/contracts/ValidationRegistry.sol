// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IIdentityRegistry {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/**
 * @title ValidationRegistry — ERC-8004 Trustless Agents
 * @notice Records validation requests against an agent and the validator's scored
 *         response (0..100). The request payload lives off-chain (requestURI + hash);
 *         the on-chain entry links agent ↔ validator ↔ outcome so anyone can verify
 *         that an agent's work was independently checked.
 * @dev Non-upgradeable port of the ERC-8004 reference ValidationRegistry, adapted to
 *      Solidity 0.8.24 / OpenZeppelin v5.2.
 */
contract ValidationRegistry is Ownable {
    address public immutable identityRegistry;

    event ValidationRequest(
        address indexed validatorAddress,
        uint256 indexed agentId,
        string requestURI,
        bytes32 indexed requestHash
    );

    event ValidationResponse(
        address indexed validatorAddress,
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint8 response,
        string responseURI,
        bytes32 responseHash,
        string tag
    );

    struct ValidationStatus {
        address validatorAddress;
        uint256 agentId;
        uint8 response; // 0..100
        bytes32 responseHash;
        string tag;
        uint256 lastUpdate;
        bool hasResponse;
    }

    mapping(bytes32 => ValidationStatus) private _validations;
    mapping(uint256 => bytes32[]) private _agentValidations;
    mapping(address => bytes32[]) private _validatorRequests;

    constructor(address identityRegistry_) Ownable(msg.sender) {
        require(identityRegistry_ != address(0), "bad identity");
        identityRegistry = identityRegistry_;
    }

    // ─── Requests & responses ────────────────────────────────────────────────────

    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external {
        require(validatorAddress != address(0), "bad validator");
        require(_validations[requestHash].validatorAddress == address(0), "exists");

        // Caller must be the agent owner or an approved operator.
        IIdentityRegistry registry = IIdentityRegistry(identityRegistry);
        address agentOwner = registry.ownerOf(agentId);
        require(
            msg.sender == agentOwner ||
            registry.isApprovedForAll(agentOwner, msg.sender) ||
            registry.getApproved(agentId) == msg.sender,
            "Not authorized"
        );

        _validations[requestHash] = ValidationStatus({
            validatorAddress: validatorAddress,
            agentId: agentId,
            response: 0,
            responseHash: bytes32(0),
            tag: "",
            lastUpdate: block.timestamp,
            hasResponse: false
        });

        _agentValidations[agentId].push(requestHash);
        _validatorRequests[validatorAddress].push(requestHash);

        emit ValidationRequest(validatorAddress, agentId, requestURI, requestHash);
    }

    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external {
        ValidationStatus storage s = _validations[requestHash];
        require(s.validatorAddress != address(0), "unknown");
        require(msg.sender == s.validatorAddress, "not validator");
        require(response <= 100, "resp>100");

        s.response = response;
        s.responseHash = responseHash;
        s.tag = tag;
        s.lastUpdate = block.timestamp;
        s.hasResponse = true;

        emit ValidationResponse(s.validatorAddress, s.agentId, requestHash, response, responseURI, responseHash, tag);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getValidationStatus(bytes32 requestHash)
        external
        view
        returns (address validatorAddress, uint256 agentId, uint8 response, bytes32 responseHash, string memory tag, uint256 lastUpdate)
    {
        ValidationStatus memory s = _validations[requestHash];
        require(s.validatorAddress != address(0), "unknown");
        return (s.validatorAddress, s.agentId, s.response, s.responseHash, s.tag, s.lastUpdate);
    }

    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory) {
        return _agentValidations[agentId];
    }

    /**
     * @notice Average validator response for an agent.
     * @param validatorAddresses optional filter; empty = any validator.
     * @param tag optional filter; empty string = any tag.
     */
    function getSummary(
        uint256 agentId,
        address[] calldata validatorAddresses,
        string calldata tag
    ) external view returns (uint64 count, uint8 avgResponse) {
        bytes32 tagHash = keccak256(bytes(tag));
        bytes32 emptyHash = keccak256(bytes(""));

        uint256 totalResponse;
        bytes32[] storage requestHashes = _agentValidations[agentId];

        for (uint256 i; i < requestHashes.length; i++) {
            ValidationStatus storage s = _validations[requestHashes[i]];
            if (!s.hasResponse) continue;

            bool matchValidator = validatorAddresses.length == 0;
            for (uint256 v; v < validatorAddresses.length && !matchValidator; v++) {
                if (validatorAddresses[v] == s.validatorAddress) matchValidator = true;
            }
            if (!matchValidator) continue;
            if (tagHash != emptyHash && keccak256(bytes(s.tag)) != tagHash) continue;

            totalResponse += s.response;
            count++;
        }

        avgResponse = count == 0 ? 0 : uint8(totalResponse / count);
    }
}
