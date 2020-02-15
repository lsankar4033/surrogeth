const ethers = jest.genMockFromModule("ethers");

// Allows tests to set the broadcasters found in the mocked out registry contract
let broadcasters = [];
let broadcasterToLocator = {};
function __setBroadcasters(_broadcasters, _locatorTypes) {
  broadcasters = _broadcasters;

  broadcasterToLocator = {};
  for (const i in broadcasters) {
    const broadcaster = broadcasters[i];
    broadcasterToLocator[broadcaster] = {
      locator: String(broadcaster),
      locatorType: _locatorTypes[i]
    };
  }
}

let relayers = [];
let relayerToFeeAgg = {};
function __setRelayers(_relayers, _feeAggs) {
  relayers = _relayers;

  relayerToFeeAgg = {};
  for (const i in relayers) {
    const relayer = relayers[i];
    relayerToFeeAgg[relayer] = {
      feeSum: { toNumber: () => _feeAggs[i][0] },
      feeCount: { toNumber: () => _feeAggs[i][1] }
    };
  }
}

class Contract {
  constructor(address, abi, provider) {}

  async relayersCount(type) {
    if (type == 1) {
      return {
        toNumber: () => broadcasters.length
      };
    } else {
      return {
        toNumber: () => relayers.length
      };
    }
  }

  async relayerByIdx(type, idx) {
    if (type == 1) {
      return broadcasters[idx];
    } else {
      return relayers[idx];
    }
  }

  async relayerToLocator(address) {
    return broadcasterToLocator[address];
  }

  async relayerToFeeAgg(address) {
    return relayerToFeeAgg[address];
  }
}

ethers.__setBroadcasters = __setBroadcasters;
ethers.__setRelayers = __setRelayers;
ethers.Contract = Contract;

module.exports = ethers;
