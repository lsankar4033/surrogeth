/**
 * Utilities for simulating ethereum txes on a forked blockchain.
 */

const Accounts = require("web3-eth-accounts");
const accounts = new Accounts();

const { createForkedWeb3 } = require("./engines");
const { relayerAccount } = require("../utils");

/**
 * Sign the provided tx.
 */
const signTx = async (forkedWeb3, tx, privateKey) => {
  const result = await forkedWeb3.eth.accounts.signTransaction(tx, privateKey);
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
const simulateTx = async (network, to, data, value) => {
  const forkedWeb3 = createForkedWeb3(network);
  const { address, privateKey } = relayerAccount;

  const tx = await buildSimTx(forkedWeb3, to, data, value);

  // NOTE: gas price used is median gas price of last few blocks
  const signedTx = await signTx(forkedWeb3, tx, privateKey);

  const initBalance = await forkedWeb3.eth.getBalance(address);
  await forkedWeb3.eth.sendSignedTransaction(signedTx);
  const finalBalance = await forkedWeb3.eth.getBalance(address);

  const profit = finalBalance - initBalance;
  return profit;
};

module.exports = {
  simulateTx
};
