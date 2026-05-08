// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArcPredict
 * @notice Binary prediction market contract for Arc Testnet.
 *         Uses USDC as the betting token and a simple LMSR-lite pool model.
 *
 * @dev Pool model:
 *      - YES shares = usdcIn * totalYesPool / (totalYesPool + totalNoPool + usdcIn)  (simplified AMM)
 *      - On resolution, winning-side share-holders split the entire pool pro-rata.
 */
contract ArcPredict is Ownable, ReentrancyGuard {
    // ─── Constants ────────────────────────────────────────────────────────────
    uint8 public constant OUTCOME_YES = 0;
    uint8 public constant OUTCOME_NO  = 1;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    // ─── State ─────────────────────────────────────────────────────────────────
    IERC20 public immutable usdc;

    struct Market {
        string   question;
        address  creator;
        uint256  resolutionTime;
        bool     resolved;
        uint8    winningOutcome;
        uint256  totalYesShares;
        uint256  totalNoShares;
        uint256  totalYesPool;    // USDC in YES side
        uint256  totalNoPool;     // USDC in NO side
        uint256  feeBps;
    }

    struct Position {
        uint256 yesShares;
        uint256 noShares;
        uint256 yesCost;  // USDC paid for YES shares
        uint256 noCost;   // USDC paid for NO shares
    }

    uint256 public marketCount;
    mapping(uint256 => Market)   private markets;
    mapping(uint256 => mapping(address => Position)) private positions;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // ─── Events ───────────────────────────────────────────────────────────────
    event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint256 resolutionTime);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, uint8 outcome, uint256 amount, uint256 shares);
    event MarketResolved(uint256 indexed marketId, uint8 winningOutcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed claimer, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    // ─── Market Creation ──────────────────────────────────────────────────────
    function createMarket(
        string calldata question,
        uint256 resolutionTime,
        uint256 feeBps
    ) external returns (uint256 marketId) {
        require(resolutionTime > block.timestamp, "Resolution in the past");
        require(feeBps <= 1000, "Fee too high");

        marketId = marketCount++;
        markets[marketId] = Market({
            question:       question,
            creator:        msg.sender,
            resolutionTime: resolutionTime,
            resolved:       false,
            winningOutcome: 0,
            totalYesShares: 0,
            totalNoShares:  0,
            totalYesPool:   0,
            totalNoPool:    0,
            feeBps:         feeBps
        });

        emit MarketCreated(marketId, msg.sender, question, resolutionTime);
    }

    // ─── Place Bet ────────────────────────────────────────────────────────────
    function placeBet(
        uint256 marketId,
        uint8   outcome,
        uint256 usdcAmount,
        uint256 minShares
    ) external nonReentrant {
        Market storage m = markets[marketId];
        require(!m.resolved, "Market resolved");
        require(block.timestamp < m.resolutionTime, "Market expired");
        require(outcome == OUTCOME_YES || outcome == OUTCOME_NO, "Invalid outcome");
        require(usdcAmount > 0, "Amount zero");

        // Collect fee
        uint256 fee    = (usdcAmount * m.feeBps) / BPS_DENOMINATOR;
        uint256 netIn  = usdcAmount - fee;

        // Transfer USDC from user
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "Transfer failed");

        // Send fee to owner
        if (fee > 0) {
            require(usdc.transfer(owner(), fee), "Fee transfer failed");
        }

        // Calculate shares (simplified constant-product style)
        uint256 shares = _calculateShares(m, outcome, netIn);
        require(shares >= minShares, "Slippage exceeded");

        // Update pools
        Position storage pos = positions[marketId][msg.sender];
        if (outcome == OUTCOME_YES) {
            m.totalYesPool   += netIn;
            m.totalYesShares += shares;
            pos.yesShares    += shares;
            pos.yesCost      += usdcAmount;
        } else {
            m.totalNoPool    += netIn;
            m.totalNoShares  += shares;
            pos.noShares     += shares;
            pos.noCost       += usdcAmount;
        }

        emit BetPlaced(marketId, msg.sender, outcome, usdcAmount, shares);
    }

    // ─── Resolve Market ───────────────────────────────────────────────────────
    function resolveMarket(uint256 marketId, uint8 winningOutcome) external onlyOwner {
        Market storage m = markets[marketId];
        require(!m.resolved, "Already resolved");
        require(winningOutcome == OUTCOME_YES || winningOutcome == OUTCOME_NO, "Invalid outcome");

        m.resolved       = true;
        m.winningOutcome = winningOutcome;

        emit MarketResolved(marketId, winningOutcome);
    }

    // ─── Claim Winnings ───────────────────────────────────────────────────────
    function claimWinnings(uint256 marketId) external nonReentrant {
        Market storage m = markets[marketId];
        require(m.resolved, "Not resolved");
        require(!hasClaimed[marketId][msg.sender], "Already claimed");

        uint256 payout = _getPotentialWinnings(marketId, msg.sender, m);
        require(payout > 0, "Nothing to claim");

        hasClaimed[marketId][msg.sender] = true;

        require(usdc.transfer(msg.sender, payout), "Transfer failed");
        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    // ─── View Functions ───────────────────────────────────────────────────────
    function getMarket(uint256 marketId)
        external view returns (Market memory)
    {
        return markets[marketId];
    }

    function getUserPosition(uint256 marketId, address user)
        external view returns (
            uint256 yesShares,
            uint256 noShares,
            uint256 yesCost,
            uint256 noCost
        )
    {
        Position storage p = positions[marketId][user];
        return (p.yesShares, p.noShares, p.yesCost, p.noCost);
    }

    function getMarketCount() external view returns (uint256) {
        return marketCount;
    }

    function calculateShares(
        uint256 marketId,
        uint8   outcome,
        uint256 usdcAmount
    ) external view returns (uint256) {
        Market storage m = markets[marketId];
        uint256 fee   = (usdcAmount * m.feeBps) / BPS_DENOMINATOR;
        uint256 netIn = usdcAmount - fee;
        return _calculateShares(m, outcome, netIn);
    }

    function getPotentialWinnings(uint256 marketId, address user)
        external view returns (uint256)
    {
        Market storage m = markets[marketId];
        return _getPotentialWinnings(marketId, user, m);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────
    /**
     * Simplified AMM share formula:
     *   shares = netIn * PRECISION / (existingPool + netIn) * existingShares
     * When pool is empty: shares = netIn (1 share per USDC, 6-decimal precision).
     */
    function _calculateShares(
        Market storage m,
        uint8 outcome,
        uint256 netIn
    ) internal view returns (uint256 shares) {
        uint256 pool   = outcome == OUTCOME_YES ? m.totalYesPool   : m.totalNoPool;
        uint256 supply = outcome == OUTCOME_YES ? m.totalYesShares : m.totalNoShares;

        if (supply == 0 || pool == 0) {
            // Bootstrap: 1 share per USDC (6 decimals)
            return netIn;
        }
        // shares = netIn * supply / (pool + netIn)
        shares = (netIn * supply) / (pool + netIn);
    }

    function _getPotentialWinnings(
        uint256 marketId,
        address user,
        Market storage m
    ) internal view returns (uint256) {
        if (!m.resolved) return 0;
        if (hasClaimed[marketId][user]) return 0;

        Position storage pos = positions[marketId][user];
        uint256 totalPool    = m.totalYesPool + m.totalNoPool;

        if (m.winningOutcome == OUTCOME_YES && pos.yesShares > 0 && m.totalYesShares > 0) {
            return (pos.yesShares * totalPool) / m.totalYesShares;
        }
        if (m.winningOutcome == OUTCOME_NO && pos.noShares > 0 && m.totalNoShares > 0) {
            return (pos.noShares * totalPool) / m.totalNoShares;
        }
        return 0;
    }
}
