/**
 * Utilities for getting objects used in interacting with forked or real Ethereum.
 */

const ganache = require("ganache-core");
const ethers = require("ethers");
const Web3 = require("web3");

const {
  KOVAN_RPC_URL,
  MAINNET_RPC_URL,
  LOCAL_RPC_URL,
  SURROGETH_PRIVATE_KEY
} = require("../config");

const networkToRpcUrl = network => {
  if (network === "KOVAN") {
    return KOVAN_RPC_URL;
  } else if (network === "MAINNET") {
    return MAINNET_RPC_URL;
  } else if (network === "LOCAL") {
    return LOCAL_RPC_URL;
  } else {
    throw `Network ${network} not recognized!`;
  }
};

/**
 * Create a forked version of web3 using the provided rpcUrl
 */
const createForkedWeb3 = network => {
  const rpcUrl = networkToRpcUrl(network);
  return new Web3(
    ganache.provider({
      fork: rpcUrl
    })
  );
};

// NOTE: Creates a new provider on *each* invocation
const getEthersProvider = network => {
  const rpcUrl = networkToRpcUrl(network);
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

// NOTE: Creates a new provider/wallet on *each* invocation
const getEthersWallet = network => {
  const rpcUrl = networkToRpcUrl(network);
  return new ethers.Wallet(SURROGETH_PRIVATE_KEY, rpcUrl);
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
  } else if (network === "LOCAL") {
    return true;
  } else {
    throw `Network ${network} not recognized!`;
  }
};

module.exports = {
  createForkedWeb3,
  getEthersProvider,
  getEthersWallet,
  isValidRecipient
};
