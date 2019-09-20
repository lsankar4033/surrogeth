const ethers = require("ethers");

// TODO: populate once I deploy
const DEFAULT_REGISTRY_ADDRESSES = {
  KOVAN: "0x0",
  MAINNET: "0x0"
};

class SurrogethClient {
  constructor(web3, registryAddresses = DEFAULT_REGISTRY_ADDRESSES) {
    this.provider = new ethers.providers.Web3Provider(web3.currentProvider);
    this.registryAddresses = registryAddresses;
  }

  // TODO: getRelayer, submitTx methods
}

module.exports = {
  SurrogethClient
};
