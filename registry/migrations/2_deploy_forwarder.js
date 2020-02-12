const Forwarder = artifacts.require("Forwarder");
const TestApplication = artifacts.require("TestApplication");

const testFee = 20;

module.exports = (deployer, network) => {
  deployer.deploy(Forwarder);

  if (network === "development") {
    deployer.deploy(TestApplication, testFee);
  }
};
