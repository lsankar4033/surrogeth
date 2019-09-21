// TODO: Remove if we determine that the human-readable version works for us
const relayerReputationABIOld = [
  {
    constant: true,
    inputs: [],
    name: "nextRelayer",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    name: "relayerList",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "relayerToLocator",
    outputs: [
      {
        name: "locator",
        type: "string"
      },
      {
        name: "locatorType",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address"
      }
    ],
    name: "relayerToBurn",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];

const relayerReputationABI = [
  "function nextRelayer() returns (uint256)",
  "function relayerList(uint256) returns (address)",
  "function relayerToLocator(address) returns (string locator, string locatorType)",
  "function relayerToBurn(address) returns (uint256)"
];

module.exports = {
  relayerReputationABI,
  relayerReputationABIOld
};
