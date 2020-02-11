const ERC20RelayerForwarder = artifacts.require("ERC20RelayerForwarder");

// 1% burn fraction
const burnNum = 1;
const burnDenom = 100;

module.exports = deployer => {
  deployer.deploy(ERC20RelayerForwarder, burnNum, burnDenom);
};
