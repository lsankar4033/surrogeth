const registryABI = [
  "enum RelayersType { All, WithLocator }",
  "function relayersCount(RelayersType _type)",
  "function relayerByIdx(RelayersType _type, uint256 _idx)"
];

module.exports = {
  registryABI
};
