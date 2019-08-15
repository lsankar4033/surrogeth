const ganache = require("ganache-core");
const Web3 = require('web3');
const Accounts = require('web3-eth-accounts');
const accounts = new Accounts();

// TODO: How should this be defined?
const DEFAULT_GAS_LIMIT = 100000

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
 * Simulate running a tx with the specified web3 instance and return the resulting web3 instance.
 */
const simulateTx = async (forkedWeb3, to, data, value, privateKey) => {
  const address = accounts.privateKeyToAccount(privateKey).address;

  const tx = buildSimTx(to, data, value)
  const signedTx = await signTx(forkedWeb3, tx, privateKey)

  const initBalance = await forkedWeb3.eth.getBalance(address);
  await forkedWeb3.eth.sendSignedTransaction(signedTx);
  const finalBalance = await forkedWeb3.eth.getBalance(address);

  return finalBalance - initBalance;
}

module.exports = {
  buildSimTx, // TODO: Remove from export
  createForkedWeb3,
  signTx,
  simulateTx
}
