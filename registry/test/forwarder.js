const { expectRevert } = require("openzeppelin-test-helpers");

const RelayerReputation = artifacts.require("RelayerReputation");
const RelayerForwarder = artifacts.require("RelayerForwarder");

const TestApplication = artifacts.require("TestApplication");

// TODO:
// - test that can't call relayCall or burnRelayCall from another contract

contract("RelayerForwarder", accounts => {
  const nullAddress = "0x0000000000000000000000000000000000000000";
  const owner = accounts[0];

  const burnNum = 10;
  const burnDenom = 100;

  const applicationFunding = 100;
  const applicationFee = 10;

  let forwarderContract;

  let applicationContract;
  let feePayload;
  let noFeePayload;

  beforeEach(async () => {
    forwarderContract = await RelayerForwarder.new(burnNum, burnDenom, {
      from: owner
    });

    applicationContract = await TestApplication.new(applicationFee);
    applicationContract.send(applicationFunding, { from: accounts[0] }); // NOTE: Fund application contract

    feePayload = await applicationContract.feePayload();
    noFeePayload = await applicationContract.noFeePayload();
  });

  describe("relayCall", () => {
    it("fails: reputation not set", async () => {
      await expectRevert(
        forwarderContract.relayCall(applicationContract.address, feePayload, {
          from: accounts[0]
        }),
        "RelayerForwarder: reputation contract must be set to relay calls"
      );
    });

    describe("with reputation", () => {
      let reputationContract;

      beforeEach(async () => {
        reputationContract = await RelayerReputation.new(
          forwarderContract.address
        );
        await forwarderContract.setReputation(reputationContract.address, {
          from: owner
        });
      });

      describe("no fee", () => {
        beforeEach(async () => {
          await forwarderContract.relayCall(
            applicationContract.address,
            noFeePayload,
            { from: accounts[0] }
          );
        });

        it("properly calls target application contract", async () => {
          let value = await applicationContract.value();
          assert.equal(value.toNumber(), 5);
        });

        // NOTE: This assumes that the reputation contract works as expected
        it("updates reputation with 0 burn", async () => {
          let nextRelayer = await reputationContract.nextRelayer();
          assert.equal(nextRelayer.toNumber(), 2);

          let firstRelayer = await reputationContract.relayerList(1);
          assert.equal(firstRelayer, accounts[0]);
          let secondRelayer = await reputationContract.relayerList(2);
          assert.equal(secondRelayer, nullAddress);

          let burn = await reputationContract.relayerToBurn(accounts[0]);
          assert.equal(burn.toNumber(), 0);

          let count = await reputationContract.relayerToRelayCount(accounts[0]);
          assert.equal(count.toNumber(), 1);
        });
      });

      describe("with fee", () => {
        let prevRelayerBalance;

        beforeEach(async () => {
          prevRelayerBalance = await web3.eth.getBalance(accounts[0]);
          await forwarderContract.relayCall(
            applicationContract.address,
            feePayload,
            { from: accounts[0] }
          );
        });

        it("updates reputation appropriately and stores burned eth in forwarder", async () => {
          let nextRelayer = await reputationContract.nextRelayer();
          assert.equal(nextRelayer.toNumber(), 2);

          let firstRelayer = await reputationContract.relayerList(1);
          assert.equal(firstRelayer, accounts[0]);

          let expectedBurn = (burnNum * applicationFee) / burnDenom;
          let burn = await reputationContract.relayerToBurn(accounts[0]);
          assert.equal(burn.toNumber(), expectedBurn);

          let forwarderBalance = await web3.eth.getBalance(
            forwarderContract.address
          );
          assert.equal(forwarderBalance, expectedBurn);

          let count = await reputationContract.relayerToRelayCount(accounts[0]);
          assert.equal(count.toNumber(), 1);
        });
      });
    });
  });

  describe("batchRelayCall", () => {
    it("relays call to each specified application contract", async () => {
      let reputationContract = await RelayerReputation.new(
        forwarderContract.address
      );
      await forwarderContract.setReputation(reputationContract.address, {
        from: owner
      });

      let applicationContract2 = await TestApplication.new(applicationFee);
      applicationContract2.send(applicationFunding, { from: accounts[0] }); // NOTE: Fund application contract

      // NOTE: fee on one, no fee on the other
      await forwarderContract.batchRelayCall(
        [applicationContract.address, applicationContract2.address],
        [noFeePayload, feePayload],
        { from: accounts[0] }
      );

      let value = await applicationContract.value();
      assert.equal(value.toNumber(), 5);
      let value2 = await applicationContract2.value();
      assert.equal(value2.toNumber(), 5);

      let firstRelayer = await reputationContract.relayerList(1);
      assert.equal(firstRelayer, accounts[0]);

      let count = await reputationContract.relayerToRelayCount(accounts[0]);
      assert.equal(count.toNumber(), 2);

      let expectedBurn = (burnNum * applicationFee) / burnDenom;
      let burn = await reputationContract.relayerToBurn(accounts[0]);
      assert.equal(burn.toNumber(), expectedBurn);

      let forwarderBalance = await web3.eth.getBalance(
        forwarderContract.address
      );
      assert.equal(forwarderBalance, expectedBurn);
    });
  });

  describe("burn", () => {
    it("sends all of the registry's balance to the burn address", async () => {
      let reputationContract = await RelayerReputation.new(
        forwarderContract.address
      );
      await forwarderContract.setReputation(reputationContract.address, {
        from: owner
      });

      await forwarderContract.relayCall(
        applicationContract.address,
        feePayload,
        { from: accounts[0] }
      );

      let initNullBalance = await web3.eth.getBalance(nullAddress);

      await forwarderContract.burnBalance();
      forwarderBalance = await web3.eth.getBalance(forwarderContract.address);
      assert.equal(forwarderBalance, 0);

      let finalNullBalance = await web3.eth.getBalance(nullAddress);

      // NOTE: why can't we know this value *exactly*?
      assert.isTrue(finalNullBalance > initNullBalance);
    });
  });
});
