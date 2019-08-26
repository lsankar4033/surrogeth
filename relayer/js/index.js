const express = require('express');
const { check, validationResult } = require('express-validator');

const AsyncLock = require('async-lock');

const ganache = require('ganache-core');
const ethers = require('ethers');
const Accounts = require('web3-eth-accounts');

const { isHexStr, isAddressStr } = require('./utils');
const { createForkedWeb3, simulateTx } = require('./ethereum');
const { KOVAN_RPC_URL, RELAYER_PRIVATE_KEY, RELAYER_MIN_TX_PROFIT, RELAYER_GAS_PRICE } = require('./config');

const accounts = new Accounts();
const address = accounts.privateKeyToAccount(RELAYER_PRIVATE_KEY).address

const lock = new AsyncLock();
const nonceKey = `nonce_${address}`;

const app = express();

const provider = new ethers.providers.JsonRpcProvider(KOVAN_RPC_URL);
const signer = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

/**
 * Used in determining the gas limit for submitted txes. Currently just gets the last block's gas limit.
 */
const getGasLimit = async () => {
  const blockNum = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNum);

  return block.gasLimit;
}

app.get('/address', (req, res) => {
  res.json({ address: address });
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
    from: address
  });

  // NOTE: May want to change to return a BigNumber
  const cost = gasPrice.toNumber() * gasEstimate.toNumber();
  res.json({ fee: cost + RELAYER_MIN_TX_PROFIT });
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

  const { to, data, value } = req.query;

  const forkedWeb3 = createForkedWeb3(KOVAN_RPC_URL);
  const { balanceChange, txReceipt } = await simulateTx(forkedWeb3, to, data, value);

  if (balanceChange <= RELAYER_MIN_TX_PROFIT) {
    res.status(403).json({ msg: 'Fee too low' })
  }

  lock.acquire(nonceKey, async () => {
    const nonce = await providers.getTransactionCount(address, 'pending');
    const gasLimit = await getGasLimit();
    const unsignedTx = {
      to,
      value,
      data,
      nonce,
      gasLimit,
      gasPrice: RELAYER_GAS_PRICE,
    }

    const signedTx = await signer.sign(unsignedTx);

    // Returns Promise<TransactionResponse>
    return provider.sendTransaction(signedTx);
  }).then( (txResponse) => {
    res.json({
      block: txResponse.blockNumber,
      txHash: txResponse.hash
    });
  });
});

app.listen(8080);
