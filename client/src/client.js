const axios = require("axios");
const ethers = require("ethers");
const _ = require("lodash/core");

const { reputationABI } = require("./abi");

const DEFAULT_REPUTATION_ADDRESSES = {
  KOVAN: "0x90cD6Abb6683FcB9Da915454cC49F3fa4cb0a5b1"
};

// NOTE: We may want this to be an arg in the future
const DEFAULT_RELAYER_BATCH_SIZE = 10;

const getFeeRoute = locator => {
  return `${locator}/fee`;
};

const getSubmitTxRoute = locator => {
  return `${locator}/submit_tx`;
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
    this.network = network;
    this.provider = provider;
    this.reputationAddress = reputationAddress;
  }

  /**
   * Get the highest reputation relayers from the reputation contract.
   *
   * @param {number} numRelayers - The number of relayers to return.
   * @param {Set<string>} addressesToIgnore - Any relayer addresses to skip over.
   * @param {Set<string>} allowedLocatorTypes - The locator types to include.
   *
   * @returns {Array<{locator: string, locatorType: string, burn: number, address: string}>} An array of
   * information objects corresponding to relayers
   */
  async getRelayers(
    numRelayers = 1,
    addressesToIgnore = new Set([]),
    allowedLocatorTypes = new Set(["ip", "tor"])
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
      return [];
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

    // Iterate backwards through candidates until we hit 'numRelayers' of an allowed locator type
    let toReturn = [];
    for (const candidate of sortedCandidates) {
      const { address, burn } = candidate;
      const { locator, locatorType } = await contract.relayerToLocator(address);

      if (allowedLocatorTypes.has(locatorType)) {
        toReturn.push({ locator, locatorType, address, burn });
      }

      if (toReturn.length >= numRelayers) {
        break;
      }
    }

    return toReturn;
  }

  /**
   * Returns the fee for the specified relayer.
   *
   * @param {{locator: string, locatorType: string}} relayer - The relayer whose fee to return, as specified
   * by a locator (i.e. IP address) and locatorType string (i.e. 'ip')
   *
   * @returns {number|null} The fee in Wei advertised by the specified relayer.
   */
  async getRelayerFee(relayer) {
    const { locator, locatorType } = relayer;

    if (locatorType !== "ip") {
      console.log(
        `Can't communicate with relayer at ${locator} of locatorType ${locatorType} because only IP supported right now.`
      );
      return null;
    }

    const resp = await axios.get(getFeeRoute(locator));

    if (resp.statusCode !== 200) {
      console.log(
        `${resp.status} error retrieving fee from relayer ${locator}`
      );
      return null;
    }

    return resp.data["fee"];
  }

  /**
   * Submit the specified transaction to the specified relayer.
   *
   * @param {{locator: string, locatorType: string}} relayer - The relayer whose fee to return, as specified
   * by a locator (i.e. IP address) and locatorType string (i.e. 'ip')
   * @param {{to: string, data: string, value: number}} tx - The transaction info to submit. 'to' is a hex string
   * representing the address to send to and 'data' is a hex string or an empty string representing the data
   * payload of the transaction
   *
   * @returns {string|null} The transaction hash of the submitted transaction
   */
  async submitTx(tx, relayer) {
    const { locator, locatorType } = relayer;
    const { to, data, value } = tx;

    if (locatorType !== "ip") {
      console.log(
        `Can't communicate with relayer at ${locator} of locatorType ${locatorType} because only IP supported right now.`
      );
      return null;
    }

    const resp = await axios.post(getSubmitTxRoute(locator), {
      to,
      data,
      value,
      network: this.network
    });

    if (resp.status !== 200) {
      console.log(`${resp.status} error submitting tx to relayer ${locator}`);
    }

    return resp.data.txHash;
  }
}

module.exports = {
  SurrogethClient
};
