const YieldManager = artifacts.require("YieldManager");

module.exports = function (deployer, network, accounts) {
  // Update these addresses for Sepolia
  const zkCoprocessor = "0xF7E9CB6b7A157c14BCB6E6bcf63c1C7c92E952f5"; // BrevisRequest contract on Sepolia (replace with actual address)
  const brevisProof = "0x2241C52472862038dFFdAb38b88410CAC2685D15"; // BrevisProof contract on Sepolia (replace with actual address)
  const pancakeFactory = "0x2Aa22c502cc0d5206Cd1dC7945f641FA1C3807D9"; // PancakeSwap v4 Factory (ensure this is available on Sepolia or use a test version)
  const positionManager = "0x9e85391B63aC2E4eBa7352DdaB7e6042476813C7"; // Actual Position Manager address on Sepolia (replace with actual address)
  const baseToken = "0xe9e7cea3dedca5984780bafc599bd69add087d56"; // BUSD or its equivalent on Sepolia (replace with actual address)
  const priceLimit = "2000000000000000000"; // 2 tokens (adjust as needed)

  // Deploy the YieldManager contract with updated addresses
  deployer.deploy(YieldManager, zkCoprocessor, pancakeFactory, positionManager, baseToken, priceLimit, brevisProof);
};
