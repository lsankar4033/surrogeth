const Accounts = require("web3-eth-accounts");
const accounts = new Accounts();

const { RELAYER_PRIVATE_KEY } = require("./config");

const relayerAccount = {
  privateKey: RELAYER_PRIVATE_KEY,
  address: accounts.privateKeyToAccount(RELAYER_PRIVATE_KEY).address
};

const hexStrRE = /^0x[0-9A-Fa-f]+$/;

const isHexStr = s => {
  return s.length % 2 == 0 && hexStrRE.test(s);
};

const isAddressStr = s => {
  return s.length == 42 && hexStrRE.test(s);
};

const isNetworkStr = s => {
  return s === "MAINNET" || s === "KOVAN";
};

module.exports = {
  isHexStr,
  isAddressStr,
  isNetworkStr,
  relayerAccount
};
