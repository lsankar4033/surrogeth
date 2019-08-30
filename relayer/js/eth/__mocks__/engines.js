const ethers = require("ethers");

const { relayerAccount } = require("../../utils");

const SIGNED = "0x123";
const INIT_RELAYER_BALANCE = 10000;
const GAS_LIMIT = 100;
const TEST_NETWORK = "FOO";

const TEST_WEB3_TX = {
  to: "0x0000000000000000000000000000000000000001",
  data: "",
  value: 300,
  gas: GAS_LIMIT
};

const createForkedWeb3 = network => {
  expect(network).toBe(TEST_NETWORK);

  let relayerAddress = relayerAccount.address;

  let balances = {};
  balances[relayerAddress] = INIT_RELAYER_BALANCE;

  let ret = { eth: { accounts: {} } };
  ret.eth.getBalance = address => {
    if (address in balances) {
      return balances[address];
    } else {
      return 0;
    }
  };
  ret.eth.accounts.signTransaction = (tx, privateKey) => {
    expect(tx).toStrictEqual(TEST_WEB3_TX);
    expect(privateKey).toBe(relayerAccount.privateKey);

    return { rawTransaction: SIGNED };
  };
  ret.eth.sendSignedTransaction = signedTx => {
    expect(signedTx).toBe(SIGNED);

    const { to, value } = TEST_WEB3_TX;

    balances[relayerAddress] -= value;
    if (!(to in balances)) {
      balances[to] = 0;
    }
    balances[to] += value;
  };
  ret.eth.getBlock = b => {
    expect(b).toBe("latest");

    return { gasLimit: GAS_LIMIT };
  };

  return ret;
};

const TEST_GAS_PRICE = 1000;
const TEST_GAS_ESTIMATE = 32;
const TEST_ETHERS_TX = {
  to: "0x0000000000000000000000000000000000000001",
  data: "",
  value: 300,
  from: relayerAccount.address
};

// .getTransactionCount (nonce)
// .getBlockNumber
// .getBlock
// .sendTransaction (signed)
const getEthersProvider = network => {
  expect(network).toBe(TEST_NETWORK);

  return {
    getGasPrice: () => ethers.utils.bigNumberify(TEST_GAS_PRICE),

    estimateGas: tx => {
      expect(tx).toStrictEqual(TEST_ETHERS_TX);

      return ethers.utils.bigNumberify(TEST_GAS_ESTIMATE);
    }
  };
};

// .sign {to, value, data, nonce, gasLimit, gasPrice}
const getEthersWallet = network => {
  expect(network).toBe(TEST_NETWORK);
};

module.exports = {
  createForkedWeb3,
  getEthersProvider,
  getEthersWallet,
  TEST_WEB3_TX,
  TEST_ETHERS_TX,
  TEST_NETWORK,
  TEST_GAS_ESTIMATE,
  TEST_GAS_PRICE
};
