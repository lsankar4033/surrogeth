const ethers = jest.genMockFromModule("ethers");

// Allows tests to set the relayers found in the mocked out registry contract
let relayers = [];
let relayerToLocator = {};
function __setRelayers(_relayers, _locatorTypes) {
  relayers = _relayers;

  relayerToLocator = {};
  for (const i in relayers) {
    const relayer = relayers[i];
    relayerToLocator[relayer] = {
      locator: String(relayer),
      locatorType: _locatorTypes[i]
    };
  }
}

class Contract {
  constructor(address, abi, provider) {}

  async relayersCount(type) {
    if (type == 1) {
      return {
        toNumber: () => relayers.length
      };
    } else {
      return 0;
    }
  }

  async relayerByIdx(type, idx) {
    if (type == 1) {
      return relayers[idx];
    } else {
      return {};
    }
  }

  async relayerToLocator(address) {
    return relayerToLocator[address];
  }
}

ethers.__setRelayers = __setRelayers;
ethers.Contract = Contract;

module.exports = ethers;
