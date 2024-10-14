// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MockV4Interfaces.sol";
import "./IZKCoprocessor.sol";

contract YieldManager is Ownable {
    struct YieldStrategy {
        uint256 optimalYield;
        uint256 liquidityToAllocate;
        uint256 timestamp;
    }

    IZKCoprocessor public zkCoprocessor;
    IVault public vault;
    ICLPoolManager public clPoolManager;
    IBinPoolManager public binPoolManager;
    YieldStrategy public currentStrategy;
    IZKCoprocessor.PoolAllocation[] public currentAllocations;
    address public baseToken;
    uint256 public priceLimit;

    mapping(address => uint256) public userYields;

    event StrategyUpdated(uint256 optimalYield, uint256 liquidityAllocated, uint256 timestamp);
    event YieldClaimed(address indexed user, uint256 amount);
    event PriceLimitUpdated(uint256 newPriceLimit);
    event PoolRebalanced(IZKCoprocessor.PoolAllocation[] newAllocations);

    constructor(
        address _zkCoprocessor,
        address _vault,
        address _clPoolManager,
        address _binPoolManager,
        address _baseToken,
        uint256 _priceLimit
    ) Ownable() {
        zkCoprocessor = IZKCoprocessor(_zkCoprocessor);
        vault = IVault(_vault);
        clPoolManager = ICLPoolManager(_clPoolManager);
        binPoolManager = IBinPoolManager(_binPoolManager);
        baseToken = _baseToken;
        priceLimit = _priceLimit;
    }

    function updateYieldStrategy(
        uint256 _optimalYield, 
        uint256 _liquidityToAllocate, 
        bytes memory zkProof
    ) external onlyOwner {
        require(
            zkCoprocessor.verifyStrategyProof(_optimalYield, _liquidityToAllocate, zkProof),
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
        IZKCoprocessor.PoolAllocation[] memory newAllocations,
        bytes memory zkProof
    ) external {
        require(msg.sender == address(zkCoprocessor), "Only zk-Coprocessor can rebalance");
        
        for (uint256 i = 0; i < newAllocations.length; i++) {
            uint256 price = getPriceFromPool(newAllocations[i].poolKey);
            require(price >= priceLimit, "Price below limit");
        }

        require(newAllocations.length >= 1, "At least one allocation required");

        require(zkCoprocessor.verifyRebalanceProof(newAllocations, zkProof), "Invalid proof");
        
        rebalancePools(newAllocations);
    }

    function rebalancePools(IZKCoprocessor.PoolAllocation[] memory newAllocations) internal {
        // Clear current allocations
        delete currentAllocations;

        for (uint256 i = 0; i < newAllocations.length; i++) {
            // Push each allocation to storage
            currentAllocations.push(newAllocations[i]);

            // Approve the vault for the allocation amount
            IERC20(baseToken).approve(address(vault), newAllocations[i].amount);

            // Determine if it's a CL pool or Bin pool and add liquidity accordingly
            if (clPoolManager.poolExists(newAllocations[i].poolKey)) {
                addLiquidityToCLPool(newAllocations[i]);
            } else if (binPoolManager.poolExists(newAllocations[i].poolKey)) {
                addLiquidityToBinPool(newAllocations[i]);
            } else {
                revert("Invalid pool key");
            }
        }

        emit PoolRebalanced(currentAllocations);
    }

    function addLiquidityToCLPool(IZKCoprocessor.PoolAllocation memory allocation) internal {
        int24 tickLower = -887272;  // Example lower tick
        int24 tickUpper = 887272;   // Example upper tick
        uint256 amount1Desired = 0; // For simplicity, we're only adding liquidity for token0
        
        clPoolManager.addLiquidity(
            allocation.poolKey,
            tickLower,
            tickUpper,
            allocation.amount,
            amount1Desired,
            0, // amount0Min, set to 0 for simplicity
            0, // amount1Min, set to 0 for simplicity
            address(this)
        );
    }

    function addLiquidityToBinPool(IZKCoprocessor.PoolAllocation memory allocation) internal {
        uint256[] memory ids = new uint256[](1);
        uint256[] memory amounts = new uint256[](1);
        ids[0] = 0; // Assuming we're adding to the first bin for simplicity
        amounts[0] = allocation.amount;
        
        binPoolManager.addLiquidity(
            allocation.poolKey,
            ids,
            amounts,
            address(this)
        );
    }

    function getPriceFromPool(bytes32 poolKey) public view returns (uint256) {
        (uint160 sqrtPriceX96, ) = clPoolManager.getPrice(poolKey);
        // Convert sqrtPriceX96 to a more usable price format
        return uint256(sqrtPriceX96) * uint256(sqrtPriceX96) * 1e18 >> (96 * 2);
    }

    function claimYield() external {
        uint256 yield = userYields[msg.sender];
        require(yield > 0, "No yield to claim");

        userYields[msg.sender] = 0;
        IERC20(baseToken).transfer(msg.sender, yield);

        emit YieldClaimed(msg.sender, yield);
    }

    function updatePriceLimit(uint256 _newPriceLimit) external onlyOwner {
        priceLimit = _newPriceLimit;
        emit PriceLimitUpdated(_newPriceLimit);
    }
}