// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AMANTVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public constant USDY = 0x5bE26527e817998A7206475496fDE1E68957c5A6;
    address public constant METH = 0xcDA86A272531e8640cD7F1a92c01839911B90bb0;

    address public agentExecutor;
    address public chronicleContract;

    enum RiskMode { SAFE, BALANCED, AGGRESSIVE }

    struct UserPosition {
        uint256 usdyAmount;
        uint256 methAmount;
        uint256 goalAmount;       // target in token decimals
        uint256 goalDeadline;     // unix timestamp
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
        string signalSource; // "FED_RATE", "ONDO_HEALTH", "ETH_STAKING", "APY_DIFF"
    }

    mapping(address => UserPosition) public positions;
    mapping(address => RebalanceAction[]) public rebalanceHistory;
    mapping(address => uint256) public pendingYield;

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
    event YieldAccrued(address indexed user, uint256 amount);
    event YieldDistributed(address indexed user, uint256 amount);
    event AgentExecutorUpdated(address indexed oldAgent, address indexed newAgent);

    modifier onlyAgent() {
        require(msg.sender == agentExecutor, "AMANT: only agent");
        _;
    }

    constructor(address _agentExecutor) Ownable(msg.sender) {
        require(_agentExecutor != address(0), "AMANT: zero address");
        agentExecutor = _agentExecutor;
    }

    // ─── User Actions ────────────────────────────────────────────────────────

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
        require(token == USDY || token == METH, "AMANT: unsupported token");
        require(amount > 0, "AMANT: zero amount");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        UserPosition storage pos = positions[msg.sender];
        if (token == USDY) {
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
        require(token == USDY || token == METH, "AMANT: unsupported token");
        require(amount > 0, "AMANT: zero amount");

        UserPosition storage pos = positions[msg.sender];

        if (token == USDY) {
            require(pos.usdyAmount >= amount, "AMANT: insufficient USDY");
            pos.usdyAmount -= amount;
        } else {
            require(pos.methAmount >= amount, "AMANT: insufficient METH");
            pos.methAmount -= amount;
        }

        IERC20(token).safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, token, amount);
    }

    function claimYield() external nonReentrant {
        uint256 yield_ = pendingYield[msg.sender];
        require(yield_ > 0, "AMANT: no pending yield");

        pendingYield[msg.sender] = 0;
        positions[msg.sender].totalYieldClaimed += yield_;

        // Distribute in USDY (stable asset)
        IERC20(USDY).safeTransfer(msg.sender, yield_);
        emit YieldDistributed(msg.sender, yield_);
    }

    // ─── Agent Actions ────────────────────────────────────────────────────────

    function logRebalance(
        address user,
        string calldata fromToken,
        string calldata toToken,
        uint256 amount,
        string calldata reason,
        string calldata signalSource
    ) external onlyAgent {
        RebalanceAction memory action = RebalanceAction({
            fromToken: fromToken,
            toToken: toToken,
            amount: amount,
            reason: reason,
            timestamp: block.timestamp,
            signalSource: signalSource
        });

        rebalanceHistory[user].push(action);

        // Update position allocation to reflect intent
        UserPosition storage pos = positions[user];
        if (
            keccak256(bytes(fromToken)) == keccak256(bytes("USDY")) &&
            keccak256(bytes(toToken)) == keccak256(bytes("METH"))
        ) {
            uint256 shift = amount > pos.usdyAmount ? pos.usdyAmount : amount;
            pos.usdyAmount -= shift;
            pos.methAmount += shift;
        } else if (
            keccak256(bytes(fromToken)) == keccak256(bytes("METH")) &&
            keccak256(bytes(toToken)) == keccak256(bytes("USDY"))
        ) {
            uint256 shift = amount > pos.methAmount ? pos.methAmount : amount;
            pos.methAmount -= shift;
            pos.usdyAmount += shift;
        }

        emit Rebalanced(user, fromToken, toToken, amount, reason, signalSource);
    }

    function accrueYield(address user, uint256 amount) external onlyAgent {
        pendingYield[user] += amount;
        emit YieldAccrued(user, amount);
    }

    function distributeYield(address user, uint256 amount) external onlyAgent nonReentrant {
        require(IERC20(USDY).balanceOf(address(this)) >= amount, "AMANT: insufficient vault balance");
        positions[user].totalYieldClaimed += amount;
        IERC20(USDY).safeTransfer(user, amount);
        emit YieldDistributed(user, amount);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getPosition(address user) external view returns (UserPosition memory) {
        return positions[user];
    }

    function getRebalanceHistory(address user) external view returns (RebalanceAction[] memory) {
        return rebalanceHistory[user];
    }

    function getRebalanceCount(address user) external view returns (uint256) {
        return rebalanceHistory[user].length;
    }

    function getTotalValue(address user) external view returns (uint256) {
        UserPosition memory pos = positions[user];
        // Simple: 1 USDY ≈ 1 USD (18 decimals), mETH value depends on ETH price
        // For demo purposes, treat 1 mETH = 1 unit same scale
        return pos.usdyAmount + pos.methAmount;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setAgentExecutor(address _agent) external onlyOwner {
        require(_agent != address(0), "AMANT: zero address");
        emit AgentExecutorUpdated(agentExecutor, _agent);
        agentExecutor = _agent;
    }

    function setChronicle(address _chronicle) external onlyOwner {
        chronicleContract = _chronicle;
    }
}
