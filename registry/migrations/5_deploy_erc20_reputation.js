const ERC20RelayerReputation = artifacts.require("ERC20RelayerReputation");
const ERC20RelayerForwarder = artifacts.require("ERC20RelayerForwarder");

module.exports = deployer => {
  deployer
    .deploy(ERC20RelayerReputation, ERC20RelayerForwarder.address)
    .then(() => {
      return ERC20RelayerForwarder.deployed();
    })
    .then(forwarder => {
      forwarder.setReputation(ERC20RelayerReputation.address);
    });
};
