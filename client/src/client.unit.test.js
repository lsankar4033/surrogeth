const { SurrogethClient } = require("./client");

jest.mock("ethers");

describe("getBestRelayer", () => {
  test("returns null if no candidates", async () => {
    require("ethers").__setRelayers([], {});

    const client = new SurrogethClient();
    const nextRelayer = await client.getBestRelayer();

    expect(nextRelayer).toBe(null);
  });

  test("returns the best relayer by burn", async () => {
    require("ethers").__setRelayers([1, 2, 3], {
      1: 100,
      2: 300,
      3: 90
    });

    const client = new SurrogethClient();

    let nextRelayer = await client.getBestRelayer();
    expect(nextRelayer).toBe("2");
  });

  test("ignores the specified addresses in figuring out which to return", async () => {
    require("ethers").__setRelayers([1, 2, 3], {
      1: 100,
      2: 300,
      3: 90
    });

    const client = new SurrogethClient();

    let nextRelayer = await client.getBestRelayer(new Set([2]));
    expect(nextRelayer).toBe("1");
  });
});
