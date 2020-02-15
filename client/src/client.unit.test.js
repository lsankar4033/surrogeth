const { SurrogethClient } = require("./client");

jest.mock("ethers");

describe("getBroadcasters", () => {
  test("returns an empty list if no candidates in contract", async () => {
    require("ethers").__setBroadcasters([], {});

    const client = new SurrogethClient();
    const relayers = await client.getBroadcasters();

    expect(relayers).toStrictEqual([]);
  });

  test("ignore locators that aren't allowed", async () => {
    require("ethers").__setBroadcasters([1, 2, 3], ["ip", "ip", "tor"]);

    const client = new SurrogethClient();

    let relayers = await client.getBroadcasters(1, new Set(["tor"]));
    expect(relayers).toStrictEqual([
      {
        address: 3,
        locator: "3",
        locatorType: "tor"
      }
    ]);
  });

  test("returns an empty list if no relayers with the specified locator type", async () => {
    require("ethers").__setBroadcasters([1, 2, 3], ["ip", "ip", "ip"]);

    const client = new SurrogethClient();

    let relayers = await client.getBroadcasters(1, new Set(["tor"]));
    expect(relayers).toStrictEqual([]);
  });

  test("returns multiple relayers if more than 1 is asked for", async () => {
    require("ethers").__setBroadcasters([1, 2, 3], ["tor", "ip", "ip"]);

    const client = new SurrogethClient();

    let relayers = await client.getBroadcasters(2, new Set(["tor", "ip"]));
    expect(relayers).toStrictEqual([
      {
        address: 1,
        locator: "1",
        locatorType: "tor"
      },
      {
        address: 2,
        locator: "2",
        locatorType: "ip"
      }
    ]);
  });
});

describe("getAvgFee", () => {
  test("normal functioning w/multiple fees", async () => {
    require("ethers").__setRelayers([1, 2, 3], [[100, 2], [150, 4], [50, 4]]);

    const client = new SurrogethClient();

    let avgFee = await client.getAvgFee();
    expect(avgFee).toBe(30);
  });

  test("return null if no fees", async () => {
    require("ethers").__setRelayers([], []);

    const client = new SurrogethClient();

    let avgFee = await client.getAvgFee();
    expect(avgFee).toBe(null);
  });
});
