const ganache = require("ganache-core");
const Web3 = require("web3");
const Accounts = require("web3-eth-accounts");
const accounts = new Accounts();

/**
 * Create a forked version of web3 using the provided rpcUrl
 */
const createForkedWeb3 = rpcUrl => {
  return new Web3(
    ganache.provider({
      fork: rpcUrl
    })
  );
};

/**
 * Sign the provided tx. Assumes that tx is as complete as it needs to be (i.e. with a valid nonce if on a
 * non-forked chain).
 */
const signTx = async (web3, tx, privateKey) => {
  const result = await web3.eth.accounts.signTransaction(tx, privateKey);
  return result["rawTransaction"];
};

/**
 *  Build a transaction to be run on a forked web3 instance. Note that we don't need to lock on nonce
 *  generation here as it's assumed that independent forked web3 instance are spun up for each transaction
 *  simulation.
 */
const buildSimTx = async (forkedWeb3, to, data, value) => {
  // NOTE: may be able to optimize performance by hardcoding gas limit, etc.
  const block = await forkedWeb3.eth.getBlock("latest");
  return {
    gas: block.gasLimit,
    to,
    data,
    value
  };
};

/**
 * Simulate running a tx with the specified web3 instance. Returns the transaction receipt and the balance change
 * to the specified account.
 */
const simulateTx = async (forkedWeb3, to, data, value, privateKey) => {
  const address = accounts.privateKeyToAccount(privateKey).address;

  const tx = await buildSimTx(forkedWeb3, to, data, value);
  const signedTx = await signTx(forkedWeb3, tx, privateKey);

  const initBalance = await forkedWeb3.eth.getBalance(address);
  const txReceipt = await forkedWeb3.eth.sendSignedTransaction(signedTx);
  const finalBalance = await forkedWeb3.eth.getBalance(address);

  return {
    balanceChange: finalBalance - initBalance,
    txReceipt
  };
};

module.exports = {
  createForkedWeb3,
  simulateTx
};
