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

    this.attemptedRelayerAddresses = new Set([]);
  }

  /**
   * Determines the next relayer node to try and returns its IP address.
   *
   * @returns {string} the IP address of the relayer found
   */
  async nextRelayer() {
    const contract = new ethers.Contract(
      this.reputationAddress,
      reputationABI,
      this.provider
    );

    const candidates = [];

    const nextRelayerId = (await contract.nextRelayer()).toNumber();
    for (var relayerId = 1; relayerId < nextRelayerId; relayerId++) {
      const relayerAddress = await contract.relayerList(relayerId);

      if (!this.attemptedRelayerAddresses.has(relayerAddress)) {
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

    const sortedCandidates = _.sortBy(candidatesWithBurn, [({ burn }) => burn]);
    const bestCandidate = sortedCandidates[-1];

    // TODO: Only return a locator if its an IP!
    const { locator, locatorType } = await contract.relayerToLocator(
      bestCandidate.address
    );
    return locator;
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
