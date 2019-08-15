const express = require('express');
const { check, validationResult } = require('express-validator');

const ganache = require('ganache-core');
const Web3 = require('web3');
const Accounts = require('web3-eth-accounts');
const accounts = new Accounts();

const { RPC_URL, PRIVATE_KEY } = require('./config');
const ADDRESS = accounts.privateKeyToAccount(PRIVATE_KEY).address

// TODO: Better logging
const app = express();

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
 * Simulate running a tx with the specified web3 instance and return the resulting web3 instance
 */
const simulateTx = async (web3, to, data, value) => {

  console.log('hi');

}

app.get('/address', (req, res) => {
  res.json({ address: ADDRESS });
});

app.post('/submit_tx', [
  check('to').isHexadecimal(),
  check('data').isHexadecimal(),
  check('value').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }

  // TODO: why doesn't request body work with express-validator
  const { to, data, value } = req.query;

  console.log('Initializing forked ganache');
  const forkedWeb3 = createForkedWeb3(RPC_URL);

  res.json('ok');

  //console.log('Getting block num');
  //const blockNum = await web3.eth.getBlockNumber();


  // NOTE: On actual tx submission make sure to lock on getting nonce
});

// TODO routes:
// - fee

// TODO: Pull port from env
app.listen(3000);
