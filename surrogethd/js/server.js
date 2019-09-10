const express = require("express");
const { check, validationResult } = require("express-validator");

const AsyncLock = require("async-lock");

const {
  relayerAccount,
  isHexStr,
  isAddressStr,
  isNetworkStr,
  isValidRecipient
} = require("./utils");
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
    check("data").custom(isHexStr),
    check("value").isInt(),
    check("network").custom(isNetworkStr)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    }
    const { to, data, value, network } = req.query;

    if (!isValidRecipient(to, network)) {
      res.status(403).json({ msg: `I don't send transactions to ${to}` });
    }

    const fee = await getFee(network, to, data, value);
    res.json({ fee });
  }
);

app.post(
  "/submit_tx",
  [
    check("to").custom(isAddressStr),
    check("data").custom(isHexStr),
    check("value").isInt(),
    check("network").custom(isNetworkStr)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    }
    const { to, data, value, network } = req.query;

    if (!isValidRecipient(to, network)) {
      res.status(403).json({ msg: `I don't send transactions to ${to}` });
    }

    const profit = await simulateTx(network, to, data, value);
    if (profit <= SURROGETH_MIN_TX_PROFIT) {
      res.status(403).json({ msg: "Fee too low" });
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

app.listen(8080, () => console.log("Listening on port 8080"));
