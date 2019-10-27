const express = require("express");
const cors = require("cors");

const { check, validationResult } = require("express-validator");

const AsyncLock = require("async-lock");

// Configure console logging statements
require("console-stamp")(console);

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
  SURROGETH_FEE,
  SURROGETH_MIN_TX_PROFIT
} = require("./config");

const { simulateTx } = require("./eth/simulationEth");
const { sendTransaction } = require("./eth/eth");

const lock = new AsyncLock();
const nonceKey = `nonce_${relayerAccount.address}`;

const app = express();

// enable CORS
app.use(cors());
app.options("*", cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());

app.get("/address", (req, res) => {
  console.info("Serving address request");
  res.json({ address: relayerAccount.address });
});

app.get("/fee", async (req, res) => {
  console.info("Serving fee request");
  res.json({ fee: SURROGETH_FEE });
});

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
      return res.status(422).json({ errors: errors.array() });
    }
    const { to, data, value, network } = req.body;

    console.info(
      `Serving tx submission request: to: ${to}, value: ${value}, network: ${network}, data: ${data}`
    );

    if (!isValidRecipient(to, network)) {
      return res
        .status(403)
        .json({ msg: `I don't send transactions to ${to}` });
    }

    // simulate the transaction
    const profit = await simulateTx(network, to, data, value);

    // only check whether the profit is sufficient if SURROGETH_MIN_TX_PROFIT
    // is set to a positive value
    if (SURROGETH_MIN_TX_PROFIT > 0 && profit <= SURROGETH_MIN_TX_PROFIT) {
      return res.status(403).json({
        msg: `Fee too low! Try increasing the fee by ${SURROGETH_MIN_TX_PROFIT -
          profit} Wei`
      });
    }

    // TODO: Push nonce locking down to submission method and unit test it
    const { blockNumber, hash } = await lock.acquire(nonceKey, async () => {
      return sendTransaction(network, to, data, value);
    });

    res.json({
      block: blockNumber,
      txHash: hash
    });
  }
);

module.exports = app;
