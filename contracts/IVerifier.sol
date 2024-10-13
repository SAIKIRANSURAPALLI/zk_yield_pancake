// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IVerifier {
    function verifyProof(
        uint256[2] memory proof_a,
        uint256[2][2] memory proof_b,
        uint256[2] memory proof_c,
        uint256[2] memory input
    ) external view returns (bool);
}
