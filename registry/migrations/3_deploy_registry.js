const Registry = artifacts.require("Registry");
const Forwarder = artifacts.require("Forwarder");

module.exports = deployer => {
  deployer
    .deploy(Registry, Forwarder.address)
    .then(() => {
      return Forwarder.deployed();
    })
    .then(forwarder => {
      forwarder.setReputation(Registry.address);
    });
};
