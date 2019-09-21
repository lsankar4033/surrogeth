const ethers = require("ethers");
const { relayerReputationABI } = require("./abi");

// TODO: populate once I deploy
const DEFAULT_REGISTRY_ADDRESSES = {
  KOVAN: "0x0",
  MAINNET: "0x0"
};

// TODO: Add support for ERC20 reputation!
/**
 * Class representing a single surrogeth client. Maintains state about which relayers it's already tried to
 * communicate with.
 */
class SurrogethClient {
  constructor(web3, registryAddresses = DEFAULT_REGISTRY_ADDRESSES) {
    this.provider = new ethers.providers.Web3Provider(web3.currentProvider);
    this.registryAddresses = registryAddresses;

    this.attemptedRelayerAddresses = [];
  }

  /**
   * Determines the next relayer node to try and returns its IP address.
   *
   * @returns {string} the IP address of the relayer found
   */
  async nextRelayer() {
    // 1. get all addresses from contract
    // 2. pick best reputation address we haven't seen yet (fallback to default)
    // 3. else return null
  }

  /**
   * Submits the provided transaction to the provided relayer.
   *
   * @param tx transaction to submit
   * @param {string} relayer relayer IP address to try
   */
  async submitTxToRelayer(tx, relayer) {
    // TODO
  }

  // TODO: Multiple submit method
}

module.exports = {
  SurrogethClient
};
