const { expectRevert } = require("openzeppelin-test-helpers");

const RelayerReputation = artifacts.require("RelayerReputation");

contract("RelayerReputation", accounts => {
  let reputationContract;
  let forwarder = accounts[0];

  beforeEach(async () => {
    reputationContract = await RelayerReputation.new(accounts[0]);
  });

  describe("setRelayerLocator", () => {
    it("fails: setting locator for address other than one's own", async () => {
      await expectRevert(
        reputationContract.setRelayerLocator(accounts[2], "foo", "bar", {
          from: accounts[1]
        }),
        "RelayerReputation: can only set the locator for self"
      );
    });

    it("sets locator properly", async () => {
      reputationContract.setRelayerLocator(accounts[1], "foo", "bar", {
        from: accounts[1]
      });

      let { locator, locatorType } = await reputationContract.relayerToLocator(
        accounts[1]
      );
      assert.equal(locator, "foo");
      assert.equal(locatorType, "bar");
    });
  });

  describe("updateReputation", () => {
    it("fails: can only update reputation from forwarder address", async () => {
      await expectRevert(
        reputationContract.updateReputation(accounts[3], 100, {
          from: accounts[1]
        }),
        "RelayerReputation: caller is not the forwarder"
      );
    });
  });
});
