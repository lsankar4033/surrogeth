const express = require('express');
const { check, validationResult } = require('express-validator');

const AsyncLock = require('async-lock');

const ganache = require('ganache-core');
const ethers = require('ethers');
const Accounts = require('web3-eth-accounts');

const { isHexStr, isAddressStr, isNetworkStr } = require('./utils');
const { createForkedWeb3, simulateTx } = require('./ethereum');
const {
  KOVAN_RPC_URL, MAINNET_RPC_URL,
  RELAYER_PRIVATE_KEY, RELAYER_MIN_TX_PROFIT
} = require('./config');

const accounts = new Accounts();
const address = accounts.privateKeyToAccount(RELAYER_PRIVATE_KEY).address

const lock = new AsyncLock();
const nonceKey = `nonce_${address}`;

const app = express();

const networkToRpcUrl = {
  KOVAN: KOVAN_RPC_URL,
  MAINNET: MAINNET_RPC_URL
};
const networkToProvider = {
  KOVAN: new ethers.providers.JsonRpcProvider(networkToRpcUrl['KOVAN']),
  MAINNET: new ethers.providers.JsonRpcProvider(networkToRpcUrl['MAINNET'])
};
const networkToSigner = {
  KOVAN: new ethers.Wallet(RELAYER_PRIVATE_KEY, networkToProvider['KOVAN']),
  MAINNET: new ethers.Wallet(RELAYER_PRIVATE_KEY, networkToProvider['MAINNET'])
};

/**
 * Used in determining the gas limit for submitted txes. Currently just gets the last block's gas limit.
 */
const getGasLimit = async (network) => {
  const provider = networkToProvider[network]
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
  check('value').isInt(),
  check('network').custom(isNetworkStr)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }

  const { to, data, value, network } = req.query;
  const provider = networkToProvider[network];

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
  check('value').isInt(),
  check('network').custom(isNetworkStr)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }

  const { to, data, value, network } = req.query;
  const rpcUrl = networkToRpcUrl[network];
  const provider = networkToProvider[network];
  const signer = networkToSigner[network];

  const forkedWeb3 = createForkedWeb3(rpcUrl);
  const { balanceChange, txReceipt } = await simulateTx(forkedWeb3, to, data, value);
  const { gasUsed } = txReceipt;
  const gasPrice = await provider.getGasPrice();
  const gasCost = gasUsed * gasPrice.toNumber();

  if (balanceChange - gasCost <= RELAYER_MIN_TX_PROFIT) {
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
      gasPrice,
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

app.listen(8080, () => console.log('Listening on port 8080'));
