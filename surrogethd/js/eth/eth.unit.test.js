beforeEach(() => {
  jest.mock("./engines");
  jest.mock("../config");
});

describe("getFee", () => {
  test("computes the fee properly", async () => {
    const { getFee } = require("./eth");
    const {
      TEST_ETHERS_TX,
      TEST_NETWORK,
      TEST_GAS_ESTIMATE,
      TEST_GAS_PRICE
    } = require("./engines");
    const { SURROGETH_MIN_TX_PROFIT } = require("../config");

    const { to, data, value } = TEST_ETHERS_TX;
    const fee = await getFee(TEST_NETWORK, to, data, value);

    expect(fee).toBe(
      TEST_GAS_ESTIMATE * TEST_GAS_PRICE + SURROGETH_MIN_TX_PROFIT
    );
  });
});

describe("sendTransaction", () => {
  test("signs and sends the specified transaction", async () => {
    const { sendTransaction } = require("./eth");
    const {
      TEST_ETHERS_TX,
      TEST_NETWORK,
      TEST_TX_HASH,
      TEST_BLOCK_NUM
    } = require("./engines");

    const { to, data, value } = TEST_ETHERS_TX;
    const { hash, blockNumber } = await sendTransaction(
      TEST_NETWORK,
      to,
      data,
      value
    );

    expect(hash).toBe(TEST_TX_HASH);
    expect(blockNumber).toBe(TEST_BLOCK_NUM);
  });
});
