const ethers = jest.genMockFromModule("ethers");

// Allows tests to set the relayers found in the mocked out reputation contract
let relayers = [];
let relayerToLocator = {};
let relayerToBurn = {};
function __setRelayers(_relayers, _relayerToBurn) {
  relayers = _relayers;

  relayerToLocator = {};
  for (const relayer of relayers) {
    relayerToLocator[relayer] = {
      locator: String(relayer),
      locatorType: "ip"
    };
  }

  relayerToBurn = _relayerToBurn;
}

class Contract {
  constructor(address, abi, provider) {
    // TODO: make sure that address, abi, provider are as expected
  }

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
