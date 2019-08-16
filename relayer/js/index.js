const express = require('express');
const { check, validationResult } = require('express-validator');

const ganache = require('ganache-core');
const ethers = require('ethers');
const Accounts = require('web3-eth-accounts');
const accounts = new Accounts();

const { isHexStr, isAddressStr } = require('./utils');
const { createForkedWeb3, simulateTx } = require('./ethereum');
const { KOVAN_RPC_URL, PRIVATE_KEY, MIN_TX_PROFIT, GAS_PRICE } = require('./config');
const ADDRESS = accounts.privateKeyToAccount(PRIVATE_KEY).address

const app = express();
const provider = new ethers.providers.JsonRpcProvider(KOVAN_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

/**
 * Used in determining the gas limit for submitted txes. Currently just gets the last block's gas limit.
 */
const getGasLimit = async () => {
  const blockNum = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNum);

  return block.gasLimit;
}

app.get('/address', (req, res) => {
  res.json({ address: ADDRESS });
});

app.get('/fee', [
  check('to').custom(isAddressStr),
  check('data').custom(isHexStr),
  check('value').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }

  const { to, data, value } = req.query;

  const gasPrice = await provider.getGasPrice();
  const gasEstimate = await provider.estimateGas({
    to,
    data,
    value,
    from: ADDRESS
  });

  // NOTE: May want to change to return a BigNumber
  const cost = gasPrice.toNumber() * gasEstimate.toNumber();
  res.json({ fee: cost + MIN_TX_PROFIT });
});

app.post('/submit_tx', [
  check('to').custom(isAddressStr),
  check('data').custom(isHexStr),
  check('value').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }

  // TODO: why doesn't request body work with express-validator
  const { to, data, value } = req.query;

  const forkedWeb3 = createForkedWeb3(KOVAN_RPC_URL);
  const { balanceChange, txReceipt } = await simulateTx(forkedWeb3, to, data, value);

  if (balanceChange <= MIN_TX_PROFIT) {
    res.status(403).json({ msg: 'Fee too low' })
  }

  // TODO: lock on get+submit
  const nonce = await providers.getTransactionCount(ADDRESS, 'pending');
  const gasLimit = await getGasLimit();
  const tx = {
    to,
    value,
    data,
    nonce,
    gasLimit,
    gasPrice: GAS_PRICE,
  }

  const signedTx = await signer.sign(tx);

  const tx = provider.sendTransaction(signedTx);

  // TODO: tx.catch hook. i.e. re-submit to network

  res.json({
    block: tx.blockNumber,
    txHash: tx.hash
  });
});

// TODO: Pull port from env
app.listen(3000);
