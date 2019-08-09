const ganache = require("ganache-core");
const Web3 = require('web3');

// NOTE: We could remove this require in favor of passing these into fn calls, but this makes testing easier
const { PRIVATE_KEY, ADDRESS, DEFAULT_GAS_LIMIT } = require('./config');

/**
 * Create a forked version of web3 using the provided rpcUrl
 */
const createForkedWeb3 = (rpcUrl) => {
  return new Web3(
    ganache.provider({
      'fork': rpcUrl
    })
  );
};

/**
 * Sign the provided tx. Assumes that tx is as complete as it needs to be (i.e. with a valid nonce if on a
 * non-forked chain).
 */
const signTx = async (web3, tx, privateKey) => {
  const result = await web3.eth.accounts.signTransaction(tx, privateKey);
  return result['rawTransaction'];
}

// NOTE: we don't have to lock on specifying nonce because this is assumed to be happening on a forked web3
const buildSimTx = (to, data, value) => {
  return {
    to,
    data,
    value,
    gas: DEFAULT_GAS_LIMIT
  }
}

/**
 * Simulate running a tx with the specified web3 instance and return the resulting web3 instance. Returns the
 * change in balance to ADDRESS.
 */
const simulateTx = async (forkedWeb3, to, data, value) => {
  const tx = buildSimTx(to, data, value)
  const signedTx = signTx(forkedWeb3, tx, PRIVATE_KEY)

  const initBalance = await forkedWeb3.eth.getBalance(ADDRESS);
  await forkedWeb3.eth.sendSignedTransaction(signedTx);
  const finalBalance = await forkedWeb3.eth.getBalance(ADDRESS);

  return finalBalance - initBalance;
}

module.exports = {
  buildSimTx, // TODO: Remove from export
  createForkedWeb3,
  signTx,
  simulateTx
}
