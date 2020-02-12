const { expectRevert } = require("openzeppelin-test-helpers");

const Registry = artifacts.require("Registry");

contract("Registry", accounts => {
  let registryContract;
  let forwarder = accounts[0];

  beforeEach(async () => {
    registryContract = await Registry.new(accounts[0]);
  });

  const checkRelayers = async (type, expected) => {
    let actualCount = await registryContract.relayersCount(type);
    assert.equal(actualCount, expected.length);

    for (let i = 0; i < expected.length; i++) {
      let relayer = await registryContract.relayerByIdx(type, i);
      assert.equal(relayer, expected[i]);

      assert.equal(
        await registryContract.relayerExists(type, expected[i]),
        true
      );
    }
  };

  describe("setRelayerLocator", () => {
    it("fails: setting locator for address other than one's own", async () => {
      await expectRevert(
        registryContract.setRelayerLocator(accounts[2], "foo", "bar", {
          from: accounts[1]
        }),
        "Registry: can only set the locator for self"
      );
    });

    it("sets locator properly", async () => {
      registryContract.setRelayerLocator(accounts[1], "foo", "bar", {
        from: accounts[1]
      });

      let { locator, locatorType } = await registryContract.relayerToLocator(
        accounts[1]
      );
      assert.equal(locator, "foo");
      assert.equal(locatorType, "bar");
    });

    it("adds to relevant lists", async () => {
      registryContract.setRelayerLocator(accounts[1], "foo", "bar", {
        from: accounts[1]
      });

      await checkRelayers(0, [accounts[1]]);
      await checkRelayers(1, [accounts[1]]);
    });
  });

  describe("logRelay", () => {
    it("fails: can only log relays from forwarder address", async () => {
      await expectRevert(
        registryContract.logRelay(accounts[3], 10, {
          from: accounts[1]
        }),
        "Registry: caller is not the forwarder"
      );
    });

    it("logs the relay and fee in relayerToFeeAgg", async () => {
      await registryContract.logRelay(accounts[3], 100, { from: accounts[0] });

      let { feeSum, feeCount } = await registryContract.relayerToFeeAgg(
        accounts[3]
      );
      assert.equal(feeSum.toNumber(), 100);
      assert.equal(feeCount.toNumber(), 1);
    });

    it("adds the relayer to all lists", async () => {
      await registryContract.logRelay(accounts[3], 100, { from: accounts[0] });

      await checkRelayers(0, [accounts[3]]);
    });
  });
});
