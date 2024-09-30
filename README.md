# ZK_YIELD_PANCAKe

## Overview

The Combined Yield Manager is a React-based web application that integrates functionality for interacting with a Yield Manager smart contract on the blockchain. It provides an interface for signing messages, managing yield allocations, updating price limits, and withdrawing from pools.

## Features

- Sign messages using Web3 wallet integration
- View current yield allocations across different pools
- Update price limits for yield management
- Withdraw funds from specific pools
- Responsive design using Ant Design components

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- Yarn package manager
- MetaMask or another Web3 wallet extension installed in your browser

## Installation

To install the Combined Yield Manager, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/combined-yield-manager.git
   cd combined-yield-manager
   ```

2. Install the dependencies:
   ```
   yarn install
   ```

## Configuration

1. Create a `.env` file in the root directory of the project.
2. Add the following environment variables:
   ```
   REACT_APP_CONTRACT_ADDRESS=your_contract_address_here
   REACT_APP_NETWORK_ID=your_network_id_here
   ```
   Replace `your_contract_address_here` with the address of your deployed Yield Manager contract and `your_network_id_here` with the appropriate network ID (e.g., 1 for Ethereum mainnet, 3 for Ropsten testnet).

## Usage

To run the Combined Yield Manager locally:

1. Start the development server:
   ```
   yarn start
   ```

2. Open your web browser and navigate to `http://localhost:3000`.

3. Connect your Web3 wallet (e.g., MetaMask) to the application.

4. Use the interface to interact with the Yield Manager contract:
   - Sign messages
   - View current allocations
   - Update price limits
   - Withdraw from pools

## Contributing

Contributions to the Combined Yield Manager project are welcome. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or feedback, please open an issue in the GitHub repository.

## Acknowledgements

- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [ethers.js](https://docs.ethers.io/)
- [Web3.js](https://web3js.readthedocs.io/)
