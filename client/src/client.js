const ethers = require("ethers");
const _ = require("lodash/core");

const { reputationABI } = require("./abi");

// TODO: populate once I deploy
const DEFAULT_REPUTATION_ADDRESSES = {
  KOVAN: "0xc5069F6E373Bf38b6bd55BDc3F6096B656aaC6c0"
};

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
  async getBestRelayerIP(
    addressesToIgnore = new Set([]),
    allowedLocatorTypes = new Set(["ip"])
  ) {
    const contract = new ethers.Contract(
      this.reputationAddress,
      reputationABI,
      this.provider
    );

    const candidates = [];

    const nextRelayerId = (await contract.nextRelayer()).toNumber();

    // TODO: batch these calls with multicall
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

    // TODO: batch these calls with multicall
    const candidatesWithBurn = await Promise.all(
      _.map(candidates, async candidate => {
        const burn = await contract.relayerToBurn(candidate);
        return { burn, address: candidate };
      })
    );

    const sortedCandidates = _.sortBy(
      candidatesWithBurn,
      ({ burn }) => -1 * burn
    );

    // Iterate backwards through candidates until we hit one of an allowed locator type
    for (const candidate of sortedCandidates) {
      const { locator, locatorType } = await contract.relayerToLocator(
        candidate.address
      );

      if (allowedLocatorTypes.has(locatorType)) {
        return locator;
      }
    }

    return null;
  }
}

module.exports = {
  SurrogethClient
};
