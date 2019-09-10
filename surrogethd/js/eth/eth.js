/**
 * Utilities for interacting with the real (not simulated) Ethereum network.
 */

const { getEthersProvider, getEthersWallet } = require("./engines");
const { RELAYER_MIN_TX_PROFIT } = require("../config");
const { relayerAccount } = require("../utils");

/**
 * Gets the fee that this relayer will quote for the provided tx.
 */
const getFee = async (network, to, data, value) => {
  const { address } = relayerAccount;
  const provider = getEthersProvider(network);

  const gasPrice = await provider.getGasPrice();
  const gasEstimate = await provider.estimateGas({
    to,
    data,
    value,
    from: address
  });

  // NOTE: May want to change to return a BigNumber
  const cost = gasPrice.toNumber() * gasEstimate.toNumber();
  return cost + RELAYER_MIN_TX_PROFIT;
};

const getGasLimit = async provider => {
  const blockNum = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNum);

  return block.gasLimit;
};

/**
 * Signs and sends the provided transaction to the given network. Currently assumes that any nonce-locking
 * happens in the calling function.
 */
const sendTransaction = async (network, to, data, value) => {
  const provider = getEthersProvider(network);
  const signer = getEthersWallet(network);

  const { address } = relayerAccount;

  const nonce = await provider.getTransactionCount(address, "pending");
  const gasLimit = await getGasLimit(provider);
  const gasPrice = await provider.getGasPrice();
  const unsignedTx = {
    to,
    value,
    data,
    nonce,
    gasLimit,
    gasPrice
  };

  const signedTx = await signer.sign(unsignedTx);

  // Returns Promise<TransactionResponse>
  return provider.sendTransaction(signedTx);
};

module.exports = {
  getFee,
  sendTransaction
};
