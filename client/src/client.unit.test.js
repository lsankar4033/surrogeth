const { SurrogethClient } = require("./client");

jest.mock("ethers");

describe("nextRelayer", () => {
  test("returns null if no candidates", async () => {
    require("ethers").__setRelayers([], {});

    const client = new SurrogethClient();
    const nextRelayer = await client.nextRelayer();

    expect(nextRelayer).toBe(null);
  });

  test("successively returns the next best relayer by burn", async () => {
    require("ethers").__setRelayers([1, 2, 3], {
      1: 100,
      2: 300,
      3: 90
    });

    const client = new SurrogethClient();

    let nextRelayer = await client.nextRelayer();
    expect(nextRelayer).toBe("2");

    nextRelayer = await client.nextRelayer();
    expect(nextRelayer).toBe("1");

    nextRelayer = await client.nextRelayer();
    expect(nextRelayer).toBe("3");

    nextRelayer = await client.nextRelayer();
    expect(nextRelayer).toBe(null);
  });
});
