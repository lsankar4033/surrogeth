const { expectRevert } = require("openzeppelin-test-helpers");

const ERC20RelayerReputation = artifacts.require("ERC20RelayerReputation");

contract("ERC20RelayerReputation", accounts => {
  let reputationContract;
  let forwarder = accounts[0];
  let relayer = accounts[3];
  let erc20 = accounts[4];

  beforeEach(async () => {
    reputationContract = await ERC20RelayerReputation.new(accounts[0]);
  });

  it("has the proper initial state", async () => {
    const nextRelayer = await reputationContract.nextRelayer();
    assert.equal(nextRelayer.toNumber(), 1);

    const nextTokenForRelayer = await reputationContract.getRelayerNextToken(
      relayer
    );
    assert.equal(nextTokenForRelayer.toNumber(), 0);
  });

  describe("updateReputation", () => {
    it("fails: can only update reputation from forwarder address", async () => {
      await expectRevert(
        reputationContract.updateReputation(relayer, erc20, 100, {
          from: accounts[1]
        }),
        "ERC20RelayerReputation: caller is not the forwarder"
      );
    });

    it("stores reputation by relayer/token pair", async () => {
      await reputationContract.updateReputation(relayer, erc20, 100, {
        from: forwarder
      });

      const nextRelayer = await reputationContract.nextRelayer();
      assert.equal(nextRelayer.toNumber(), 2);

      const insertedRelayer = await reputationContract.relayerList(1);
      assert.equal(insertedRelayer, relayer);

      const nextToken = await reputationContract.getRelayerNextToken(relayer);
      assert.equal(nextToken.toNumber(), 2);

      const insertedToken = await reputationContract.getRelayerToken(
        relayer,
        1
      );
      assert.equal(insertedToken, erc20);

      const burn = await reputationContract.relayerToTokenToBurn(
        relayer,
        erc20
      );
      assert.equal(burn.toNumber(), 100);

      const count = await reputationContract.relayerToTokenToCount(
        relayer,
        erc20
      );
      assert.equal(count.toNumber(), 1);
    });
  });
});
