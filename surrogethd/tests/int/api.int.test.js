const request = require("supertest");

const SRC_PATH = "../../js";

describe("/address", () => {
  test("returns configured address as expected", async () => {
    const app = require(`${SRC_PATH}/app`);
    const { relayerAccount } = require(`${SRC_PATH}/utils`);

    const response = await request(app).get("/address");

    expect(response.statusCode).toBe(200);
    expect(response.body["address"]).toBe(relayerAccount.address);
  });
});

// TODO: Tests for invalid query params
describe.only("/fee", () => {
  let app;
  beforeAll(() => {
    jest.mock(`${SRC_PATH}/eth/engines`);
    app = require(`${SRC_PATH}/app`);
  });

  test("determines the fee properly based on query params", async () => {
    const {
      TEST_ETHERS_TX,
      TEST_NETWORK,
      TEST_GAS_ESTIMATE,
      TEST_GAS_PRICE
    } = require(`${SRC_PATH}/eth/engines`);
    const { SURROGETH_MIN_TX_PROFIT } = require(`${SRC_PATH}/config`);

    const response = await request(app)
      .get("/fee")
      .query({
        to: TEST_ETHERS_TX.to,
        data: TEST_ETHERS_TX.data,
        value: TEST_ETHERS_TX.value,
        network: TEST_NETWORK
      });

    expect(response.statusCode).toBe(200);
    expect(response.body["fee"]).toBe(
      TEST_GAS_ESTIMATE * TEST_GAS_PRICE + SURROGETH_MIN_TX_PROFIT
    );
  });

  test("returns a 403 in the case of an invalid recipient", async () => {
    // TODO
  });
});

describe("/submit_tx", () => {
  test("submits the tx properly based on query params", async () => {
    // TODO
  });

  test("returns a 403 in the case of too low a profit", async () => {
    // TODO
  });

  test("returns a 403 in the case of an invalid recipient", async () => {
    // TODO
  });
});
