// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IZKCoprocessor {
    struct PoolAllocation {
        bytes32 poolKey;
        uint256 amount;
    }

    function verifyStrategyProof(
        uint256 optimalYield,
        uint256 liquidityToAllocate,
        bytes memory proof
    ) external view returns (bool);

    function verifyRebalanceProof(
        PoolAllocation[] memory newAllocations,
        bytes memory proof
    ) external view returns (bool);
}