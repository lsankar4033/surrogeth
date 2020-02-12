const axios = require("axios");
const ethers = require("ethers");
const _ = require("lodash/core");

const { registryABI } = require("./abi");

// TODO!
const DEFAULT_REGISTRY_ADDRESS = {};

// NOTE: We may want this to be an arg in the future
const DEFAULT_RELAYER_BATCH_SIZE = 10;

// As defined in the Registry.sol contract
const LOCATOR_RELAYERS_TYPE = 1;

const getFeeRoute = locator => {
  return `${locator}/fee`;
};

const getSubmitTxRoute = locator => {
  return `${locator}/submit_tx`;
};

const getSubmitErc20TxRoute = locator => {
  return `${locator}/submit_erc20_tx`;
};

/**
 * Class representing a single surrogeth client. Maintains state about which relayers it's already tried to
 * communicate with.
 */
class SurrogethClient {
  constructor(
    provider,
    network = "KOVAN",
    registryAddress = DEFAULT_REGISTRY_ADDRESS[network],
    protocol = "https"
  ) {
    this.network = network;
    this.provider = provider;
    this.registryAddress = registryAddress;
    this.protocol = protocol;
  }

  /**
   * Get `numRelayers` relayers with locators from the contract. If < `numRelayers` in contract with locators,
   * return all relayers from contract
   *
   * @param {number} numRelayers - The number of relayers to return.
   * @param {Set<string>} allowedLocatorTypes - The locator types to include.
   *
   * @returns {Array<{locator: string, locatorType: string, burn: number, address: string}>} An array of
   * information objects corresponding to relayers
   */
  async getRelayers(numRelayers = 1, allowedLocatorTypes = new Set(["ip"])) {
    const contract = new ethers.Contract(
      this.registryAddress,
      registryABI,
      this.provider
    );

    const addresses = [];

    const totalRelayers = (await contract.relayersCount(
      LOCATOR_RELAYERS_TYPE
    )).toNumber();

    // TODO: batch these calls with multicall
    for (var relayerId = 0; relayerId < totalRelayers; relayerId++) {
      const relayerAddress = await contract.relayerByIdx(
        LOCATOR_RELAYERS_TYPE,
        relayerId
      );
      addresses.push(relayerAddress);
    }

    // No registered relayers in the registry contract!
    if (addresses.length === 0) {
      return [];
    }

    // Iterate backwards through addresses until we hit 'numRelayers' of an allowed locator type
    let toReturn = [];
    for (const address of addresses) {
      const { locator, locatorType } = await contract.relayerToLocator(address);

      if (allowedLocatorTypes.has(locatorType)) {
        toReturn.push({ locator, locatorType, address });
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

    const resp = await axios.get(`${this.protocol}://${getFeeRoute(locator)}`);

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

    const resp = await axios.post(
      `${this.protocol}://${getSubmitTxRoute(locator)}`,
      {
        to,
        data,
        value,
        network: this.network
      }
    );

    if (resp.status !== 200) {
      console.log(`${resp.status} error submitting tx to relayer ${locator}`);
    }

    return resp.data.txHash;
  }
}

module.exports = {
  SurrogethClient
};
