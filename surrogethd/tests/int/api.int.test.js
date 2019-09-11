const request = require("supertest");

const app = require("../../js/app");

describe("/address", () => {
  beforeEach(() => {
    jest.mock("../../js/eth/engines");
  });

  test("returns configured address as expected", async () => {
    const { relayerAccount } = require("../../js/utils");

    const response = await request(app).get("/address");

    expect(response.statusCode).toBe(200);
    expect(response.body["address"]).toBe(relayerAccount.address);
  });
});
