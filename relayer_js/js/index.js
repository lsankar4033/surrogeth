const express = require('express');
const { check, validationResult } = require('express-validator');

const ganache = require('ganache-core');
const Web3 = require('web3');
const Accounts = require('web3-eth-accounts');
const accounts = new Accounts();

const { isHexStr, isAddressStr } = require('./utils');
const { createForkedWeb3, simulateTx } = require('./ethereum');
const { KOVAN_RPC_URL, PRIVATE_KEY, MIN_TX_PROFIT } = require('./config');
const ADDRESS = accounts.privateKeyToAccount(PRIVATE_KEY).address

const app = express();
const web3 = new Web3(KOVAN_RPC_URL);

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

  const gasPrice = parseInt(await web3.eth.getGasPrice());
  const gasEstimate = await web3.eth.estimateGas({
    to,
    data,
    value,
    from: ADDRESS
  });

  const cost = gasPrice * gasEstimate;

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

  // TODO: Determine how to do locking so that nonce collision doesn't happen
  // TODO: await lock

  // 1. get transaction count for nonce
  // 2. sign full transaction
  // 3. send signed transaction

  // TODO: unlock

  res.json('ok');
});

// TODO: Pull port from env
app.listen(3000);
