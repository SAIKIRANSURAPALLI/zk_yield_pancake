const YieldManager = artifacts.require("YieldManager");

module.exports = function (deployer) {
  deployer.deploy(
    YieldManager,
    "0x841ce48F9446C8E281D3F1444cB859b4A6D0738C", // zkCoprocessor address (mock address)
    "0xa9b361df352a80ba3213c656b4efa5436ec80362", // vault address (mock address)
    "0x6F9302eE8760c764d775B1550C65468Ec4C25Dfc", // clPoolManager address (mock address)
    "0xc0270E12dd2bCF9A22A928af6047e247508E5615", // binPoolManager address (mock address)
    "0x1a9fA3A74590AC1af1bB0Bc8e021Ef91aBF1A4C5", // baseToken address (mock address)
    "1000000000000000000" // priceLimit (1 ether)
  );
};
