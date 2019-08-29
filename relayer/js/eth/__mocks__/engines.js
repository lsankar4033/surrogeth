const { relayerAccount } = require("../../utils");

const INIT_RELAYER_BALANCE = 10000;
const GAS_LIMIT = 100;
const TEST_VAL = 300;
const TEST_TO = "0x0000000000000000000000000000000000000001";
const TEST_TX = {
  to: TEST_TO,
  data: "",
  value: TEST_VAL,
  gas: GAS_LIMIT
};
const TEST_NETWORK = "FOO";
const SIGNED = "0x123";

const createForkedWeb3 = network => {
  expect(network).toBe(TEST_NETWORK);

  let relayerAddress = relayerAccount.address;

  // web3 state. should re-use with ethersprovider + wallet (i.e. via a class)
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
    expect(tx).toStrictEqual(TEST_TX);
    expect(privateKey).toBe(relayerAccount.privateKey);

    return { rawTransaction: SIGNED };
  };
  ret.eth.sendSignedTransaction = signedTx => {
    expect(signedTx).toBe(SIGNED);

    balances[relayerAddress] -= TEST_VAL;
    if (!(TEST_TO in balances)) {
      balances[TEST_TO] = 0;
    }
    balances[TEST_TO] += TEST_VAL;
  };
  ret.eth.getBlock = b => {
    expect(b).toBe("latest");

    return { gasLimit: GAS_LIMIT };
  };

  return ret;
};

// TODO
const getEthersProvider = network => {};

// TODO
const getEthersWallet = network => {};

module.exports = {
  createForkedWeb3,
  getEthersProvider,
  getEthersWallet,
  TEST_TX,
  TEST_NETWORK
};
