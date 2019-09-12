const express = require("express");
const { check, validationResult } = require("express-validator");

const AsyncLock = require("async-lock");

const {
  relayerAccount,
  isTxDataStr,
  isAddressStr,
  isNetworkStr
} = require("./utils");
const { isValidRecipient } = require("./eth/engines");
const {
  KOVAN_RPC_URL,
  MAINNET_RPC_URL,
  LOCAL_RPC_URL,
  SURROGETH_MIN_TX_PROFIT
} = require("./config");

const { simulateTx } = require("./eth/simulationEth");
const { getFee, sendTransaction } = require("./eth/eth");

const lock = new AsyncLock();
const nonceKey = `nonce_${relayerAccount.address}`;

const app = express();

app.get("/address", (req, res) => {
  res.json({ address: relayerAccount.address });
});

app.get(
  "/fee",
  [
    check("to").custom(isAddressStr),
    check("data").custom(isTxDataStr),
    check("value")
      .isInt()
      .toInt(),
    check("network").custom(isNetworkStr)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    const { to, data, value, network } = req.query;

    if (!isValidRecipient(to, network)) {
      console.log("got here!");
      res.status(403).json({ msg: `${to} is not a valid recipient` });
      return;
    }

    const fee = await getFee(network, to, data, value);
    res.json({ fee });
  }
);

app.post(
  "/submit_tx",
  [
    check("to").custom(isAddressStr),
    check("data").custom(isTxDataStr),
    check("value")
      .isInt()
      .toInt(),
    check("network").custom(isNetworkStr)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    const { to, data, value, network } = req.query;

    if (!isValidRecipient(to, network)) {
      res.status(403).json({ msg: `I don't send transactions to ${to}` });
      return;
    }

    const profit = await simulateTx(network, to, data, value);
    if (profit <= SURROGETH_MIN_TX_PROFIT) {
      res.status(403).json({ msg: "Fee too low" });
      return;
    }

    // TODO: Push nonce locking down to submission method and unit test it
    lock
      .acquire(nonceKey, async () => {
        return sendTransaction(network, to, data, value);
      })
      .then(txResponse => {
        res.json({
          block: txResponse.blockNumber,
          txHash: txResponse.hash
        });
      });
  }
);

module.exports = app;
