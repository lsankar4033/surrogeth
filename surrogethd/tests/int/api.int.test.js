const request = require("supertest");

const SRC_PATH = "../../js";

let app;
beforeEach(() => {
  jest.mock(`${SRC_PATH}/eth/engines`);
  jest.mock(`${SRC_PATH}/config`);
  app = require(`${SRC_PATH}/app`);
});

describe("/address", () => {
  test("returns configured address as expected", async () => {
    const { relayerAccount } = require(`${SRC_PATH}/utils`);

    const response = await request(app).get("/address");

    expect(response.statusCode).toBe(200);
    expect(response.body["address"]).toBe(relayerAccount.address);
  });
});

describe("/fee", () => {
  test("simply returns the default fee", async () => {
    const { SURROGETH_FEE } = require(`${SRC_PATH}/config`);
    const response = await request(app).get("/fee");

    expect(response.statusCode).toBe(200);
    expect(response.body["fee"]).toBe(SURROGETH_FEE);
  });
});

// TODO: Tests for invalid query params
describe("/submit_tx", () => {
  test("submits the tx properly based on query params", async () => {
    const {
      TEST_ETHERS_TX,
      TEST_NETWORK,
      TEST_GAS_ESTIMATE,
      TEST_GAS_PRICE,
      TEST_TX_HASH,
      TEST_BLOCK_NUM
    } = require(`${SRC_PATH}/eth/engines`);

    const response = await request(app)
      .post("/submit_tx")
      .type("json")
      .send({
        to: TEST_ETHERS_TX.to,
        data: TEST_ETHERS_TX.data,
        value: TEST_ETHERS_TX.value,
        network: TEST_NETWORK
      });

    expect(response.statusCode).toBe(200);
    expect(response.body["txHash"]).toBe(TEST_TX_HASH);
    expect(response.body["block"]).toBe(TEST_BLOCK_NUM);
  });

  // TODO: Get mocking to work properly
  test.skip("returns a 403 in the case of an invalid recipient", async () => {
    const { TEST_ETHERS_TX, TEST_NETWORK } = require(`${SRC_PATH}/eth/engines`);

    const invalidRecipient = "0x0000000000000000000000000000000000000002";
    const response = await request(app)
      .get("/fee")
      .query({
        to: invalidRecipient,
        data: TEST_ETHERS_TX.data,
        value: TEST_ETHERS_TX.value,
        network: TEST_NETWORK
      });

    expect(response.statusCode).toBe(403);
    expect(response.body["msg"]).toBe(
      `${invalidRecipient} is not a valid recipient`
    );
  });

  test("returns a 403 in case of too low of profit", async () => {
    // TODO
    // NOTE: Will need to change how config is mocked to make this test easy to represent
  });
});
