const ERC20Registry = artifacts.require("ERC20Registry");
const ERC20Forwarder = artifacts.require("ERC20Forwarder");

module.exports = deployer => {
  deployer
    .deploy(ERC20Registry, ERC20Forwarder.address)
    .then(() => {
      return ERC20Forwarder.deployed();
    })
    .then(forwarder => {
      forwarder.setReputation(ERC20Registry.address);
    });
};
