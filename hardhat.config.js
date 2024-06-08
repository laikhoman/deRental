require('@nomicfoundation/hardhat-toolbox')
module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {},
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    bitfinity: {
      url: 'https://testnet.bitfinity.network',
      accounts: ['647cb887568119af7d43e8642bca02b7dd2bd6d0b61b522ee1d9165a60cb8f70'], // [process.env.DEPLOYER],
      chainId: 355113,
      timeout: 120000,
      gasPrice: 10 * 10**9,
    },
    // MUMBAI_RPC: {
    //   url: 'https://rpc-mumbai.maticvigil.com/v1/92ade6c99ebf54cfb388e446539ff00d317786be',
    //   accounts: [process.env.DEPLOYER],
    //   chainId: 80001,
    //   timeout: 120000,
    //   gasPrice: 10 * 10**9,
    // },
    
  },
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 40000,
  },
}
