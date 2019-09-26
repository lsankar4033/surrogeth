const { SurrogethClient } = require("./client");

jest.mock("ethers");

describe("getBestRelayerIP", () => {
  test("returns null if no candidates in contract", async () => {
    require("ethers").__setRelayers([], {});

    const client = new SurrogethClient();
    const nextRelayer = await client.getBestRelayerIP();

    expect(nextRelayer).toBe(null);
  });

  test("returns the best relayer by burn", async () => {
    require("ethers").__setRelayers(
      [1, 2, 3],
      ["ip", "ip", "ip"],
      [100, 300, 90]
    );

    const client = new SurrogethClient();

    let nextRelayer = await client.getBestRelayerIP();
    expect(nextRelayer).toBe("2");
  });

  test("ignores the specified addresses in figuring out which to return", async () => {
    require("ethers").__setRelayers(
      [1, 2, 3],
      ["ip", "ip", "ip"],
      [100, 300, 90]
    );

    const client = new SurrogethClient();

    let nextRelayer = await client.getBestRelayerIP(new Set([2]));
    expect(nextRelayer).toBe("1");
  });

  test("ignore locators that aren't allowed", async () => {
    require("ethers").__setRelayers(
      [1, 2, 3],
      ["ip", "ip", "tor"],
      [100, 300, 90]
    );

    const client = new SurrogethClient();

    let nextRelayer = await client.getBestRelayerIP(
      new Set([]),
      new Set(["tor"])
    );
    expect(nextRelayer).toBe("3");
  });

  test("returns null if no relayers with the specified locator type", async () => {
    require("ethers").__setRelayers(
      [1, 2, 3],
      ["ip", "ip", "ip"],
      [100, 300, 90]
    );

    const client = new SurrogethClient();

    let nextRelayer = await client.getBestRelayerIP(
      new Set([]),
      new Set(["tor"])
    );
    expect(nextRelayer).toBe(null);
  });
});
