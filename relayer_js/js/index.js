const express = require('express');
const { check, validationResult } = require('express-validator');

const ganache = require("ganache-core");
const Web3 = require('web3');

// TODO: Better logging

// TODO: Some type of switch on this. Also, allow geth node option
const RPC_URL = 'https://kovan.infura.io/v3/85fe482e0db94cbeb9020e7173a481f7';

// TODO: derive one from the other
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ADDRESS = process.env.ADDRESS;

const app = express();

// NOTE: we currently create new web3 objects on every call. Maybe we should share them? Then we need to
// do nonce locking properly.

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
const simulateTx = async (web3, to, data, value) {

  // TODO: Need to replace with sendSignedTransaction
  web3.eth.sendTransaction({
    from: ADDRESS,
    to: to,
    value: value,
    data: data
  });

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

});

// TODO routes:
// - fee

// TODO: Pull port from env
app.listen(3000);
