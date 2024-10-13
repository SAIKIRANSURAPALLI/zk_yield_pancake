const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "mention best penalty grain air analyst indoor allow artwork loud lesson spring";
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    bscTestnet: {
      provider: () => new HDWalletProvider(mnemonic, "https://data-seed-prebsc-1-s1.binance.org:8545/"),
      network_id: 97,
      gas: 8000000,
      gasPrice: 250000000000
    },
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, `https://sepolia.infura.io/v3/72220bdbc7b74d2597d104a4d41c9cbb`),
      network_id: 11155111,
      gas: 8000000,
      gasPrice: 250000000000
    }
  },
  compilers: {
    solc: {
      version: "0.8.21",
      settings: {
        optimizer: {
          enabled: true,
          runs: 15000
        },
        evmVersion: "paris"
      }
    }
  }
};
