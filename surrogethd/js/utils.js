const Accounts = require("web3-eth-accounts");
const accounts = new Accounts();

const {
  SURROGETH_PRIVATE_KEY,
  KOVAN_ALLOWED_RECIPIENTS,
  MAINNET_ALLOWED_RECIPIENTS
} = require("./config");

const relayerAccount = {
  privateKey: SURROGETH_PRIVATE_KEY,
  address: accounts.privateKeyToAccount(SURROGETH_PRIVATE_KEY).address
};

const hexStrRE = /^0x[0-9A-Fa-f]+$/;

const isHexStr = s => {
  return s.length % 2 == 0 && hexStrRE.test(s);
};

const isAddressStr = s => {
  return s.length == 42 && hexStrRE.test(s);
};

const isNetworkStr = s => {
  return ["MAINNET", "KOVAN", "LOCAL"].includes(s);
};

/**
 * Determines if the specified recipient contract is allowed to receive relayed transactions from this node
 */
const isValidRecipient = (recipient, network) => {
  if (network === "KOVAN") {
    return (
      KOVAN_ALLOWED_RECIPIENTS.length === 0 ||
      KOVAN_ALLOWED_RECIPIENTS.includes(recipient)
    );
  } else if (network === "MAINNET") {
    return (
      MAINNET_ALLOWED_RECIPIENTS.length === 0 ||
      MAINNET_ALLOWED_RECIPIENTS.includes(recipient)
    );
  } else {
    throw `Network ${network} not recognized!`;
  }
};

module.exports = {
  isHexStr,
  isAddressStr,
  isNetworkStr,
  relayerAccount,
  isValidRecipient
};
