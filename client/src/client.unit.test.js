// TODO: mock out ethers.contract
const { SurrogethClient } = require("./client");

jest.mock("ethers");

describe("nextRelayer", () => {
  test("returns null if no candidates", async () => {
    require("ethers").__setRelayers([], {}, {});

    const client = new SurrogethClient();
    const nextRelayer = await client.nextRelayer();

    expect(nextRelayer).toBe(null);
  });

  // TODO: normal test

  // TODO: test to make sure that relayers aren't re-attempted
});
