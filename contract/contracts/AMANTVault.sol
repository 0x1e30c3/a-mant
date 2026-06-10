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

    // LI.FI Diamond — cross-chain DEX aggregator for optimal swaps
    // https://docs.li.fi/integrate-li.fi-js-sdk/deploy-li.fi-smart-contracts
    address public lifiDiamond;

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
    event SwappedViaLifi(
        address indexed user,
        address indexed fromToken,
        address indexed toToken,
        uint256 fromAmount,
        uint256 receivedAmount
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

    // ─── User Actions ─────────────────────────────────────────────────────────

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

        IERC20(USDY).safeTransfer(msg.sender, yield_);
        emit YieldDistributed(msg.sender, yield_);
    }

    // ─── Agent Actions — Real Swap via LI.FI ─────────────────────────────────

    /**
     * Execute a real token swap via LI.FI Diamond aggregator.
     *
     * The agent fetches an optimal quote off-chain from li.quest/v1/quote,
     * then passes the encoded calldata here. The vault approves LI.FI,
     * executes the swap, verifies slippage, and updates position accounting.
     *
     * @param user          Portfolio owner
     * @param fromToken     USDY or METH address
     * @param toToken       METH or USDY address
     * @param fromAmount    Exact amount being swapped (in token decimals)
     * @param minToAmount   Minimum acceptable output — revert if slippage exceeded
     * @param lifiCalldata  Full encoded calldata from LI.FI quote API
     */
    function executeSwapViaLifi(
        address user,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 minToAmount,
        bytes calldata lifiCalldata
    ) external onlyAgent nonReentrant {
        require(fromToken == USDY || fromToken == METH, "AMANT: bad from token");
        require(toToken == USDY || toToken == METH, "AMANT: bad to token");
        require(fromToken != toToken, "AMANT: same token");
        require(lifiDiamond != address(0), "AMANT: lifi not configured");
        require(lifiCalldata.length > 0, "AMANT: empty calldata");

        UserPosition storage pos = positions[user];

        // Deduct from user position before swap
        if (fromToken == USDY) {
            require(pos.usdyAmount >= fromAmount, "AMANT: insufficient USDY");
            pos.usdyAmount -= fromAmount;
        } else {
            require(pos.methAmount >= fromAmount, "AMANT: insufficient METH");
            pos.methAmount -= fromAmount;
        }

        // Snapshot balance before swap to calculate received amount
        uint256 balBefore = IERC20(toToken).balanceOf(address(this));

        // Approve LI.FI to spend exactly what's needed — no more
        IERC20(fromToken).approve(lifiDiamond, fromAmount);

        // Execute via LI.FI Diamond
        (bool ok, bytes memory errData) = lifiDiamond.call(lifiCalldata);
        if (!ok) {
            // Revoke approval and restore position on failure
            IERC20(fromToken).approve(lifiDiamond, 0);
            if (fromToken == USDY) {
                pos.usdyAmount += fromAmount;
            } else {
                pos.methAmount += fromAmount;
            }
            revert(string(abi.encodePacked("AMANT: lifi swap failed: ", errData)));
        }

        // Revoke leftover approval
        IERC20(fromToken).approve(lifiDiamond, 0);

        // Verify received amount meets minimum
        uint256 received = IERC20(toToken).balanceOf(address(this)) - balBefore;
        require(received >= minToAmount, "AMANT: slippage exceeded");

        // Credit received tokens to user position
        if (toToken == USDY) {
            pos.usdyAmount += received;
        } else {
            pos.methAmount += received;
        }

        emit SwappedViaLifi(user, fromToken, toToken, fromAmount, received);
    }

    // ─── Agent Actions — Simulation Fallback ─────────────────────────────────

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

    function setLifiDiamond(address _lifi) external onlyOwner {
        require(_lifi != address(0), "AMANT: zero address");
        lifiDiamond = _lifi;
    }

    // Emergency token recovery (owner only, cannot touch user positions)
    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(token != USDY && token != METH, "AMANT: cannot recover user tokens");
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
