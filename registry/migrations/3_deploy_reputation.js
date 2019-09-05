const RelayerReputation = artifacts.require("RelayerReputation");
const RelayerForwarder = artifacts.require("RelayerForwarder");

module.exports = deployer => {
  deployer
    .deploy(RelayerReputation, RelayerForwarder.address)
    .then(() => {
      return RelayerForwarder.deployed();
    })
    .then(forwarder => {
      forwarder.setReputation(RelayerReputation.address);
    });
};
