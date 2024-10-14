// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IVault {
    function deposit(
        address token,
        uint256 amount,
        address recipient
    ) external returns (uint256 shares);

    function withdraw(
        address token,
        uint256 shares,
        address recipient
    ) external returns (uint256 amount);

    function balanceOf(address token, address account) external view returns (uint256);

    function totalAssets(address token) external view returns (uint256);

    function convertToShares(address token, uint256 assets) external view returns (uint256);

    function convertToAssets(address token, uint256 shares) external view returns (uint256);
}

interface ICLPoolManager {
    struct PoolKey {
        address token0;
        address token1;
        uint24 fee;
    }

    function poolExists(bytes32 poolKey) external view returns (bool);

    function createPool(PoolKey memory key, uint160 sqrtPriceX96) external returns (address pool);

    function addLiquidity(
        bytes32 poolKey,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        address recipient
    ) external returns (
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1,
        uint256 feeGrowthInside0LastX128,
        uint256 feeGrowthInside1LastX128
    );

    function removeLiquidity(
        bytes32 poolKey,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity
    ) external returns (uint256 amount0, uint256 amount1);

    function swap(
        bytes32 poolKey,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1);

    function getPrice(bytes32 poolKey) external view returns (uint160 sqrtPriceX96, int24 tick);

    function getPoolLiquidity(bytes32 poolKey) external view returns (uint128);

    function getPoolTickSpacing(bytes32 poolKey) external view returns (int24);
}

interface IBinPoolManager {
    struct PoolKey {
        address token0;
        address token1;
        uint256 binStep;
    }

    function poolExists(bytes32 poolKey) external view returns (bool);

    function createPool(PoolKey memory key, uint256 activeId) external returns (address pool);

    function addLiquidity(
        bytes32 poolKey,
        uint256[] memory ids,
        uint256[] memory amounts,
        address recipient
    ) external returns (uint256[] memory liquidityMinted);

    function removeLiquidity(
        bytes32 poolKey,
        uint256[] memory ids,
        uint256[] memory amounts,
        address recipient
    ) external returns (uint256 amount0, uint256 amount1);

    function swap(
        bytes32 poolKey,
        bool swapForY,
        uint256 amountIn,
        address recipient
    ) external returns (uint256 amountOut);

    function getPrice(bytes32 poolKey) external view returns (uint256 price, uint256 activeId);

    function getPoolBinStep(bytes32 poolKey) external view returns (uint256);

    function getPoolReserves(bytes32 poolKey) external view returns (uint256 reserve0, uint256 reserve1);
}