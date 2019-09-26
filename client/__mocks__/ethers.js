const ethers = jest.genMockFromModule("ethers");

// Allows tests to set the relayers found in the mocked out reputation contract
let relayers = [];
let relayerToLocator = {};
let relayerToBurn = {};
function __setRelayers(_relayers, _locatorTypes, _burns) {
  relayers = _relayers;

  relayerToLocator = {};
  relayerToBurn = {};
  for (const i in relayers) {
    const relayer = relayers[i];
    relayerToLocator[relayer] = {
      locator: String(relayer),
      locatorType: _locatorTypes[i]
    };

    relayerToBurn[relayer] = _burns[i];
  }
}

class Contract {
  constructor(address, abi, provider) {}

  async nextRelayer() {
    return {
      toNumber: () => relayers.length + 1
    };
  }

  async relayerList(id) {
    return relayers[id - 1];
  }

  async relayerToLocator(address) {
    return relayerToLocator[address];
  }

  async relayerToBurn(address) {
    return relayerToBurn[address];
  }
}

ethers.__setRelayers = __setRelayers;
ethers.Contract = Contract;

module.exports = ethers;
