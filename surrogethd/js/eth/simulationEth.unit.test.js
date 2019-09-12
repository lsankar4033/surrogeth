beforeEach(() => {
  jest.mock("./engines");
  jest.mock("../config");
});

describe("simulateTx", () => {
  test("properly computes profit of simulated tx", async () => {
    const { simulateTx } = require("./simulationEth");
    const { TEST_WEB3_TX, TEST_NETWORK } = require("./engines");

    const { to, data, value } = TEST_WEB3_TX;
    const profit = await simulateTx(TEST_NETWORK, to, data, value);

    expect(profit).toBe(-1 * value);
  });
});
