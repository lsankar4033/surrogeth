const { SurrogethClient } = require("./client");

jest.mock("ethers");

// TODO: Tests for N returned
describe("getRelayers", () => {
  test("returns an empty list if no candidates in contract", async () => {
    require("ethers").__setRelayers([], {});

    const client = new SurrogethClient();
    const relayers = await client.getRelayers();

    expect(relayers).toStrictEqual([]);
  });

  test("returns the best relayer by burn", async () => {
    require("ethers").__setRelayers(
      [1, 2, 3],
      ["ip", "ip", "ip"],
      [100, 300, 90]
    );

    const client = new SurrogethClient();

    let relayers = await client.getRelayers();
    expect(relayers).toStrictEqual([
      {
        locator: "2",
        locatorType: "ip"
      }
    ]);
  });

  test("ignores the specified addresses in figuring out which to return", async () => {
    require("ethers").__setRelayers(
      [1, 2, 3],
      ["ip", "ip", "ip"],
      [100, 300, 90]
    );

    const client = new SurrogethClient();

    let relayers = await client.getRelayers(1, new Set([2]));
    expect(relayers).toStrictEqual([
      {
        locator: "1",
        locatorType: "ip"
      }
    ]);
  });

  test("ignore locators that aren't allowed", async () => {
    require("ethers").__setRelayers(
      [1, 2, 3],
      ["ip", "ip", "tor"],
      [100, 300, 90]
    );

    const client = new SurrogethClient();

    let relayers = await client.getRelayers(1, new Set([]), new Set(["tor"]));
    expect(relayers).toStrictEqual([
      {
        locator: "3",
        locatorType: "tor"
      }
    ]);
  });

  test("returns an empty list if no relayers with the specified locator type", async () => {
    require("ethers").__setRelayers(
      [1, 2, 3],
      ["ip", "ip", "ip"],
      [100, 300, 90]
    );

    const client = new SurrogethClient();

    let relayers = await client.getRelayers(1, new Set([]), new Set(["tor"]));
    expect(relayers).toStrictEqual([]);
  });
});
