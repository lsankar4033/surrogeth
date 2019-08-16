module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      gas: 6721975,          // The default is 4712388 and that could get our way if we do load testing for batchRelayCall
    }
  },

  compilers: {
    solc: {
      version: "0.5.10"
    }
  },

  plugins: [
    'truffle-watch'
  ]
}
