const { expectRevert } = require('openzeppelin-test-helpers');

const RelayerReputation = artifacts.require("RelayerReputation");
const RelayerForwarder = artifacts.require("RelayerForwarder");

const TestApplication = artifacts.require("TestApplication");

contract("RelayerForwarder", accounts => {
  const nullAddress = "0x0000000000000000000000000000000000000000";
  const minBurn = 10;

  let forwarderContract;
  let applicationContract;

  let encodedPayload;

  beforeEach(async () => {
    forwarderContract = await RelayerForwarder.new(minBurn)

    applicationContract = await TestApplication.new();
    encodedPayload = await applicationContract.sampleEncodedPayload();
  });

  describe("relayCall", () => {
    it("fails: reputation not set", async () => {
      await expectRevert(
        forwarderContract.relayCall(
          applicationContract.address,
          encodedPayload,
          { from: accounts[0], value: minBurn + 1 }
        ),
        "RelayerForwarder: reputation must be set to relay calls"
      );
    });

    describe("with reputation", () => {
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
            { from: accounts[0], value: minBurn - 1 }
          ),
          "RelayerForwarder: relayer must burn at least minBurn wei"
        )
      });

      describe("with proper burn", () => {
        beforeEach(async () => {
          await forwarderContract.relayCall(
            applicationContract.address,
            encodedPayload,
            { from: accounts[0], value: minBurn + 1 }
          )
        });

        it("properly calls target application contract", async () => {
          let value = await applicationContract.value();
          assert.equal(value.toNumber(), 5);
        });

        it("stores burned Eth in the forwarder contract", async () => {
          let forwarderBalance = await web3.eth.getBalance(forwarderContract.address);
          assert.equal(forwarderBalance, minBurn + 1);
        });

        // NOTE: This assumes that the reputation contract works as expected
        it("updates reputation with burn", async () => {
          let nextRelayer = await reputationContract.nextRelayer();
          assert.equal(nextRelayer.toNumber(), 2);

          let firstRelayer = await reputationContract.relayerList(1);
          assert.equal(firstRelayer, accounts[0]);
          let secondRelayer = await reputationContract.relayerList(2);
          assert.equal(secondRelayer, nullAddress);

          let burn = await reputationContract.relayerToBurn(accounts[0]);
          assert.equal(burn.toNumber(), minBurn + 1);

          let count = await reputationContract.relayerToRelayCount(accounts[0]);
          assert.equal(count.toNumber(), 1);
        });
      });
    });
  });

  describe("burn", () => {

    it("sends all of the registry's balance to the burn address", async () => {
      let reputationContract = await RelayerReputation.new(forwarderContract.address);
      await forwarderContract.setReputation(reputationContract.address);

      await forwarderContract.relayCall(
        applicationContract.address,
        encodedPayload,
        { from: accounts[0], value: minBurn + 1 }
      )

      let initNullBalance = await web3.eth.getBalance(nullAddress);

      await forwarderContract.burnBalance();
      forwarderBalance = await web3.eth.getBalance(forwarderContract.address);
      assert.equal(forwarderBalance, 0);

      let finalNullBalance = await web3.eth.getBalance(nullAddress);

      assert.isTrue(finalNullBalance > initNullBalance);
    });
  });
});
