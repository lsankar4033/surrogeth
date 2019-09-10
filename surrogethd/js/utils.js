const Accounts = require("web3-eth-accounts");
const accounts = new Accounts();

const { SURROGETH_PRIVATE_KEY } = require("./config");

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
  return ["MAINNET", "KOVAN", "LOCAL"].includes(s)
};

module.exports = {
  isHexStr,
  isAddressStr,
  isNetworkStr,
  relayerAccount
};
