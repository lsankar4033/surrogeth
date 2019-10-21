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
  SURROGETH_FEE,
  SURROGETH_MIN_TX_PROFIT
} = require("./config");

const { simulateTx } = require("./eth/simulationEth");
const { sendTransaction } = require("./eth/eth");

const lock = new AsyncLock();
const nonceKey = `nonce_${relayerAccount.address}`;

const app = express();
app.use(express.json());

app.get("/address", (req, res) => {
  res.json({ address: relayerAccount.address });
});

app.get("/fee", async (req, res) => {
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

    if (!isValidRecipient(to, network)) {
      return res
        .status(403)
        .json({ msg: `I don't send transactions to ${to}` });
    }

    const profit = await simulateTx(network, to, data, value);
    if (profit <= SURROGETH_MIN_TX_PROFIT) {
      return res
        .status(403)
        .json({
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
