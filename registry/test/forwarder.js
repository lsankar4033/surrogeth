const { expectRevert } = require('openzeppelin-test-helpers');

const RelayerReputation = artifacts.require("RelayerReputation");
const RelayerForwarder = artifacts.require("RelayerForwarder");

const TestApplication = artifacts.require("TestApplication");

contract("RelayerForwarder", accounts => {
  describe("relayCall", () => {
    // TODO: Make this the right payload
    const encodedPayload = "0x1234"

    let forwarderContract;
    let applicationContract;

    beforeEach(async () => {
      forwarderContract = await RelayerForwarder.new(10)
      applicationContract = await TestApplication.new();
    });


    it("fails: reputation not set", async () => {
      await expectRevert(
        forwarderContract.relayCall(
          applicationContract.address,
          encodedPayload,
          { from: accounts[0], value: 10 }
        ),
        "RelayerForwarder: reputation must be set to relay calls"
      );
    });

    describe("withReputation", () => {
      let reputationContract;

      beforeEach(async () => {
        reputationContract = await RelayerReputation.new(forwarderContract.address);
        await forwarderContract.setReputation(reputationContract.address);
      });

      it("fails: burn not high enough", async () => {
        await expectRevert(
          forwarderContract.relayCall(
            applicationContract.address,
            encodedPayload,
            { from: accounts[0], value: 9 }
          ),
          "RelayerForwarder: relayer must burn at least minBurn wei"
        )
      });

      describe("success", () => {
        beforeEach(async () => {
          // TODO: Set up relay call
        });

        it("properly calls target application contract", async () => {

        });

        it("updates reputation with burn", async () => {

        });
      });
    });
  });
});
