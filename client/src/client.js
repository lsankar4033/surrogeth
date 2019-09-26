const ethers = require("ethers");
const _ = require("lodash/core");

const { reputationABI } = require("./abi");

// TODO: populate once I deploy
const DEFAULT_REPUTATION_ADDRESSES = {
  KOVAN: "0xc5069F6E373Bf38b6bd55BDc3F6096B656aaC6c0"
};

// TODO: Add support for ERC20 reputation!
/**
 * Class representing a single surrogeth client. Maintains state about which relayers it's already tried to
 * communicate with.
 */
class SurrogethClient {
  constructor(
    provider,
    network = "KOVAN",
    reputationAddress = DEFAULT_REPUTATION_ADDRESSES[network]
  ) {
    this.provider = provider;
    this.reputationAddress = reputationAddress;
  }

  /**
   * Determines the next relayer node to try and returns its IP address.
   *
   * @param {Set} addressesToIgnore set of Ethereum addresses to not consider
   * @returns {string} the IP address of the relayer found
   */
  async getBestRelayer(addressesToIgnore = new Set([])) {
    const contract = new ethers.Contract(
      this.reputationAddress,
      reputationABI,
      this.provider
    );

    const candidates = [];

    const nextRelayerId = (await contract.nextRelayer()).toNumber();
    for (var relayerId = 1; relayerId < nextRelayerId; relayerId++) {
      const relayerAddress = await contract.relayerList(relayerId);

      if (!addressesToIgnore.has(relayerAddress)) {
        candidates.push(relayerAddress);
      }
    }

    // No registered relayers in the reputation contract!
    if (candidates.length === 0) {
      return null;
    }

    const candidatesWithBurn = await Promise.all(
      _.map(candidates, async candidate => {
        const burn = await contract.relayerToBurn(candidate);
        return { burn, address: candidate };
      })
    );

    const sortedCandidates = _.sortBy(candidatesWithBurn, ({ burn }) => burn);
    const bestCandidate = sortedCandidates[sortedCandidates.length - 1];

    // TODO: Only return a locator if it has the proper locatorType
    const { locator } = await contract.relayerToLocator(bestCandidate.address);

    return locator;
  }

  /**
   * Submits the provided transaction to the provided relayer.
   *
   * @param tx transaction to submit
   * @param {string} relayer IP address to try
   */
  async submitTxToRelayer(tx, relayer) {
    // TODO:
    // - await axios.post to the address we care about
    // - on response, return tx hash to sender
  }

  // TODO: Get fee (from relayer)

  // TODO: Multiple submit method (gets fee as well)
}

module.exports = {
  SurrogethClient
};
