const request = require("supertest");

const app = require("../../js/app");

describe("/address", () => {
  test("returns configured address as expected", async () => {
    const { relayerAccount } = require("../../js/utils");

    const response = await request(app).get("/address");

    expect(response.statusCode).toBe(200);
    expect(response.body["address"]).toBe(relayerAccount.address);
  });
});

describe("/fee", () => {
  test("determines the fee properly based on query params", async () => {
    // TODO
  });

  test("returns a 403 in the case of an invalid recipient", async () => {
    // TODO
  });

  test("returns a 422 in the case of invalid query params", async () => {
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

  test("returns a 422 in the case of invalid query params", async () => {
    // TODO
  });
});
