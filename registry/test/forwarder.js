const { expectRevert } = require("openzeppelin-test-helpers");

const Forwarder = artifacts.require("Forwarder");

const TestRegistry = artifacts.require("TestRegistry");
const TestApplication = artifacts.require("TestApplication");

const getGasCost = async txReceipt => {
  const tx = await web3.eth.getTransaction(txReceipt.tx);
  const gasPrice = tx.gasPrice;
  return parseInt(gasPrice) * txReceipt.receipt.gasUsed;
};

contract("Forwarder", accounts => {
  const nullAddress = "0x0000000000000000000000000000000000000000";
  const owner = accounts[0];

  const applicationFunding = 100000000;
  const applicationFee = 100000;

  let forwarderContract;

  let applicationContract;
  let feePayload;
  let noFeePayload;

  beforeEach(async () => {
    forwarderContract = await Forwarder.new({ from: owner });

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
        "Forwarder: reputation contract must be set to relay calls"
      );
    });

    describe("with reputation", () => {
      let registryContract;

      beforeEach(async () => {
        registryContract = await TestRegistry.new();
        await forwarderContract.setReputation(registryContract.address, {
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

        it("logs relay", async () => {
          let curIdx = await registryContract.curIdx();
          assert.equal(curIdx.toNumber(), 1);

          let loggedRelayer = await registryContract.idxToRelayer(0);
          assert.equal(loggedRelayer, accounts[0]);
        });
      });

      describe("with fee", () => {
        let prevRelayerBalance;
        let txReceipt;

        beforeEach(async () => {
          prevRelayerBalance = await web3.eth.getBalance(accounts[0]);
          txReceipt = await forwarderContract.relayCall(
            applicationContract.address,
            feePayload,
            { from: accounts[0] }
          );
        });

        it("pays relayer", async () => {
          let curRelayerBalance = await web3.eth.getBalance(accounts[0]);
          let txGasCost = await getGasCost(txReceipt);

          // TODO: exact testing here
          assert.isAbove(txGasCost, prevRelayerBalance - curRelayerBalance);
        });
      });
    });
  });
});
