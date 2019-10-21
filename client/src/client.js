const axios = require("axios");
const ethers = require("ethers");
const _ = require("lodash/core");

const { reputationABI } = require("./abi");

// TODO: populate once I deploy the registry
const DEFAULT_REPUTATION_ADDRESSES = {
  KOVAN: "0xc5069F6E373Bf38b6bd55BDc3F6096B656aaC6c0"
};

// NOTE: We may want this to be an arg in the future
const DEFAULT_RELAYER_BATCH_SIZE = 10;

const getFeeRoute = (locator, to, data, value, network) => {
  return `${locator}/fee?to=${to}&data=${data}&value=${value}&network=${network}`;
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
    maxFeeWei = -1, // Default will use min fee specified by each relayer
    network = "KOVAN",
    reputationAddress = DEFAULT_REPUTATION_ADDRESSES[network]
  ) {
    this.network = network;
    this.provider = provider;
    this.reputationAddress = reputationAddress;
    this.maxFeeWei = maxFeeWei;
  }

  /**
   * Returns the next relayers to try
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
      const { locator, locatorType } = await contract.relayerToLocator(
        candidate.address
      );

      if (allowedLocatorTypes.has(locatorType)) {
        toReturn.push({ locator, locatorType, address: candidate.address });
      }

      if (toReturn.length >= numRelayers) {
        break;
      }
    }

    return toReturn;
  }

  // TODO: paralellization
  async submitTxToRelayers(txBuilderFn, relayers) {
    for (const { address, locator, locatorType } of relayers) {
      if (locatorType === "ip") {
        // NOTE: is this exactly what we want? We may need to document this extensively
        const getFeeTx = feeToTxFn(0);
        const resp = await axios.get(
          getFeeRoute(
            locator,
            getFeeTx.to,
            getFeeTx.data,
            getFeeTx.value,
            this.network
          )
        );

        if (resp.status === 200) {
          const relayerFee = resp.data["fee"];

          if (this.maxFeeWei == -1 || this.maxFeeWei > relayerFee) {
            const { to, data, value } = txBuilderFn(address, relayerFee);
            const resp = await axios.post(getSubmitTxRoute(locator), {
              to,
              data,
              value,
              network: this.network
            });

            if (resp.status === 200) {
              return resp.data.hash;
            } else {
              console.log(
                `${resp.status} error submitting tx to relayer ${locator}`
              );
            }
          }
        } else {
          console.log(
            `${resp.status} error retrieving fee from relayer ${locator}`
          );
        }
      }
    }

    return null;
  }

  // NOTE: returns tx hash | null
  async submitTx(txBuilderFn) {
    const attemptedRelayerAddresses = new Set([]);
    let relayers = [];

    do {
      relayers = this.getRelayers(
        DEFAULT_RELAYER_BATCH_SIZE,
        attemptedRelayerAddresses,
        new Set(["ip"])
      );
      const ret = await this.submitTxToRelayers(txBuilderFn, relayers);

      if (ret !== null) {
        return ret;
      }
    } while (relayers.length > 0);

    return null;
  }
}

module.exports = {
  SurrogethClient
};
