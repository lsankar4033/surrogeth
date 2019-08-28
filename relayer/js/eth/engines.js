/**
 * Utilities for getting objects used in interacting with forked or real Ethereum.
 */

const ganache = require("ganache-core");
const ethers = require("ethers");
const Web3 = require("web3");

const {
  KOVAN_RPC_URL,
  MAINNET_RPC_URL,
  RELAYER_PRIVATE_KEY
} = require("./config");

const networkToRpcUrl = network => {
  if (network === "KOVAN") {
    return KOVAN_RPC_URL;
  } else if (network === "MAINNET") {
    return MAINNET_RPC_URL;
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
  return new ethers.Wallet(RELAYER_PRIVATE_KEY, rpcUrl);
};
