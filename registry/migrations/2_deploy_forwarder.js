const RelayerForwarder = artifacts.require("RelayerForwarder");
const TestApplication = artifacts.require("TestApplication");

// 1% burn fraction
const burnNum = 1;
const burnDenom = 100;

const testFee = 20;

module.exports = (deployer, network) => {
  deployer.deploy(RelayerForwarder, burnNum, burnDenom);

  if (network === "development") {
    deployer.deploy(TestApplication, testFee);
  }
};
