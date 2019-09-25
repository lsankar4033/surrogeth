const reputationABI = [
  "function nextRelayer() view returns (uint256)",
  "function relayerList(uint256) view returns (address)",
  "function relayerToLocator(address) view returns (string locator, string locatorType)",
  "function relayerToBurn(address) view returns (uint256)"
];

module.exports = {
  reputationABI
};
