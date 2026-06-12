// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AMANTVaultTestnet — testnet version with configurable token addresses
/// @dev Identical logic to AMANTVault but accepts any two ERC20 tokens (mock USDY/mETH)
contract AMANTVaultTestnet is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public usdyToken;
    address public methToken;

    address public agentExecutor;
    address public chronicleContract;

    enum RiskMode { SAFE, BALANCED, AGGRESSIVE }

    struct UserPosition {
        uint256 usdyAmount;
        uint256 methAmount;
        uint256 goalAmount;
        uint256 goalDeadline;
        RiskMode riskMode;
        bool active;
        uint256 depositedAt;
        uint256 totalYieldClaimed;
    }

    struct RebalanceAction {
        string fromToken;
        string toToken;
        uint256 amount;
        string reason;
        uint256 timestamp;
        string signalSource;
    }

    mapping(address => UserPosition) public positions;
    mapping(address => RebalanceAction[]) public rebalanceHistory;
    mapping(address => uint256) public yieldPending;

    event Deposited(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);
    event GoalSet(address indexed user, uint256 goalAmount, uint256 deadline, RiskMode riskMode);
    event Rebalanced(
        address indexed user,
        string fromToken,
        string toToken,
        uint256 amount,
        string reason,
        string signalSource
    );

    modifier onlyAgent() {
        require(msg.sender == agentExecutor, "AMANT: only agent");
        _;
    }

    constructor(
        address _agentExecutor,
        address _usdyToken,
        address _methToken
    ) Ownable(msg.sender) {
        require(_agentExecutor != address(0), "AMANT: zero address");
        require(_usdyToken != address(0), "AMANT: zero USDY");
        require(_methToken != address(0), "AMANT: zero METH");
        agentExecutor = _agentExecutor;
        usdyToken = _usdyToken;
        methToken = _methToken;
    }

    function setGoal(
        uint256 goalAmount,
        uint256 durationDays,
        RiskMode riskMode
    ) external {
        require(goalAmount > 0, "AMANT: zero goal");
        require(durationDays > 0 && durationDays <= 3650, "AMANT: invalid duration");

        UserPosition storage pos = positions[msg.sender];
        pos.goalAmount = goalAmount;
        pos.goalDeadline = block.timestamp + (durationDays * 1 days);
        pos.riskMode = riskMode;
        pos.active = true;

        emit GoalSet(msg.sender, goalAmount, pos.goalDeadline, riskMode);
    }

    function deposit(address token, uint256 amount) external nonReentrant {
        require(token == usdyToken || token == methToken, "AMANT: unsupported token");
        require(amount > 0, "AMANT: zero amount");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        UserPosition storage pos = positions[msg.sender];
        if (token == usdyToken) {
            pos.usdyAmount += amount;
        } else {
            pos.methAmount += amount;
        }

        if (pos.depositedAt == 0) {
            pos.depositedAt = block.timestamp;
        }

        emit Deposited(msg.sender, token, amount);
    }

    function withdraw(address token, uint256 amount) external nonReentrant {
        require(token == usdyToken || token == methToken, "AMANT: unsupported token");
        require(amount > 0, "AMANT: zero amount");

        UserPosition storage pos = positions[msg.sender];

        if (token == usdyToken) {
            require(pos.usdyAmount >= amount, "AMANT: insufficient USDY");
            pos.usdyAmount -= amount;
        } else {
            require(pos.methAmount >= amount, "AMANT: insufficient METH");
            pos.methAmount -= amount;
        }

        IERC20(token).safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, token, amount);
    }

    function getPosition(address user) external view returns (UserPosition memory) {
        return positions[user];
    }

    function getTotalValue(address user) external view returns (uint256) {
        UserPosition memory pos = positions[user];
        return pos.usdyAmount + pos.methAmount;
    }

    function pendingYield(address user) external view returns (uint256) {
        return yieldPending[user];
    }

    function claimYield() external nonReentrant {
        uint256 amount = yieldPending[msg.sender];
        require(amount > 0, "AMANT: no yield");

        yieldPending[msg.sender] = 0;
        positions[msg.sender].totalYieldClaimed += amount;

        IERC20(usdyToken).safeTransfer(msg.sender, amount);
    }

    function setChronicle(address _chronicle) external onlyAgent {
        chronicleContract = _chronicle;
    }

    function setAgentExecutor(address _agent) external onlyOwner {
        agentExecutor = _agent;
    }

    function setAuthorizedLogger(address _logger) external onlyAgent {
        // Agent can authorize other wallets to log decisions
    }

    function setLifiDiamond(address _lifi) external onlyOwner {
        // LI.FI diamond address (unused in testnet)
    }

    function getRebalanceHistory(address user) external view returns (RebalanceAction[] memory) {
        return rebalanceHistory[user];
    }
}
