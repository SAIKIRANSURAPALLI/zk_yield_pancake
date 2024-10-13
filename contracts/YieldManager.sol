// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@pancakeswap/v3-core/contracts/interfaces/IPancakeV3Pool.sol";
import "@pancakeswap/v3-core/contracts/interfaces/IPancakeV3Factory.sol";
import "./IVerifier.sol"; // Include the zk-SNARK Verifier interface

// Define the INonfungiblePositionManager interface inline
interface INonfungiblePositionManager {
    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    function increaseLiquidity(IncreaseLiquidityParams calldata params)
        external
        payable
        returns (uint128 liquidity, uint256 amount0, uint256 amount1);
}

contract YieldManager is Ownable {
    struct YieldStrategy {
        uint256 optimalYield;
        uint256 liquidityToAllocate;
        uint256 timestamp;
    }

    struct PoolAllocation {
        address pool;
        uint256 amount;
    }

    IVerifier public zkVerifier;
    IPancakeV3Factory public pancakeFactory;
    INonfungiblePositionManager public positionManager;
    YieldStrategy public currentStrategy;
    PoolAllocation[] public currentAllocations;
    address public baseToken;
    uint256 public priceLimit;

    mapping(address => uint256) public userYields;

    event StrategyUpdated(uint256 optimalYield, uint256 liquidityAllocated, uint256 timestamp);
    event YieldClaimed(address indexed user, uint256 amount);
    event PriceLimitUpdated(uint256 newPriceLimit);
    event PoolRebalanced(PoolAllocation[] newAllocations);

    constructor(address _verifier, address _pancakeFactory, address _positionManager, address _baseToken, uint256 _priceLimit, address _initialOwner) Ownable(_initialOwner) {
        zkVerifier = IVerifier(_verifier);
        pancakeFactory = IPancakeV3Factory(_pancakeFactory);
        positionManager = INonfungiblePositionManager(_positionManager);
        baseToken = _baseToken;
        priceLimit = _priceLimit;
    }
    function updateYieldStrategy(
        uint256 _optimalYield, 
        uint256 _liquidityToAllocate, 
        uint256[2] memory proof_a,
        uint256[2][2] memory proof_b,
        uint256[2] memory proof_c
    ) external onlyOwner {
        uint256[2] memory publicInputs = [_optimalYield, _liquidityToAllocate];
        require(
            zkVerifier.verifyProof(proof_a, proof_b, proof_c, publicInputs),
            "Invalid proof"
        );

        currentStrategy = YieldStrategy({
            optimalYield: _optimalYield,
            liquidityToAllocate: _liquidityToAllocate,
            timestamp: block.timestamp
        });

        emit StrategyUpdated(_optimalYield, _liquidityToAllocate, block.timestamp);
    }

    function checkPriceLimitAndRebalance(
        PoolAllocation[] memory newAllocations,
        uint256[2] memory proof_a,
        uint256[2][2] memory proof_b,
        uint256[2] memory proof_c
    ) external {
        require(msg.sender == address(zkVerifier), "Only zk-Coprocessor can rebalance");
        
        for (uint256 i = 0; i < newAllocations.length; i++) {
            uint256 price = getPriceFromPool(newAllocations[i].pool);
            require(price >= priceLimit, "Price below limit");
        }

        require(newAllocations.length >= 1, "At least one allocation required");
        uint256[2] memory publicInputs = [uint256(uint160(newAllocations[0].pool)), newAllocations[0].amount];

        require(
            zkVerifier.verifyProof(proof_a, proof_b, proof_c, publicInputs),
            "Invalid proof"
        );

        rebalancePools(newAllocations);
    }
    function rebalancePools(PoolAllocation[] memory newAllocations) internal {
    // Clear current allocations
    delete currentAllocations;
    // Copy new allocations to storage
    for (uint256 i = 0; i < newAllocations.length; i++) {
        // Push each allocation to storage
        currentAllocations.push(newAllocations[i]);

        // Approve the position manager for the allocation amount
        IERC20(baseToken).approve(address(positionManager), newAllocations[i].amount);

        // IPancakeV3Pool pancakePool = IPancakeV3Pool(newAllocations[i].pool);
        
        uint256 amount0 = newAllocations[i].amount; // Assuming baseToken is token0
        uint256 amount1 = 0; // Replace with the amount of token1 if applicable

        INonfungiblePositionManager.IncreaseLiquidityParams memory params = INonfungiblePositionManager.IncreaseLiquidityParams({
            tokenId: 0, // Replace with actual tokenId if you're increasing liquidity of an existing position
            amount0Desired: amount0,
            amount1Desired: amount1,
            amount0Min: 0, // Set to appropriate minimum amounts
            amount1Min: 0, // Set to appropriate minimum amounts
            deadline: block.timestamp + 300 // 5 minutes from now
        });

        // Increase liquidity for the position manager
        positionManager.increaseLiquidity(params);
    }
    emit PoolRebalanced(currentAllocations);
    }
    function getPriceFromPool(address pool) public view returns (uint256) {
        IPancakeV3Pool pancakePool = IPancakeV3Pool(pool);
        (uint160 sqrtPriceX96, , , , , , ) = pancakePool.slot0();
        return uint256(sqrtPriceX96) * uint256(sqrtPriceX96) / 2**192;
    }
}