const ERC20Forwarder = artifacts.require("ERC20Forwarder");

// 1% burn fraction
const burnNum = 1;
const burnDenom = 100;

module.exports = deployer => {
  deployer.deploy(ERC20Forwarder, burnNum, burnDenom);
};
