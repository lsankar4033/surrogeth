const TestApplication = artifacts.require("TestApplication");
const RelayerForwarder = artifacts.require("RelayerForwarder");

module.exports = async () => {
  const forwarder = await RelayerForwarder.deployed();
  const application = await TestApplication.deployed();

  const feePayload = await application.feePayload();

  const singleEstimate = await forwarder.relayCall.estimateGas(
    application.address,
    feePayload
  );
  console.log(`Single relay: ${singleEstimate}`);

  let batchSize = 10;
  let batchContracts = [];
  let batchPayloads = [];
  for (var i = 0; i < batchSize; i++) {
    batchContracts.push(application.address);
    batchPayloads.push(feePayload);
  }

  let multiEstimate = await forwarder.batchRelayCall.estimateGas(
    batchContracts,
    batchPayloads
  );
  console.log(`Batch${batchSize} relay: ${multiEstimate}`);

  batchSize = 100;
  batchContracts = [];
  batchPayloads = [];
  for (var i = 0; i < batchSize; i++) {
    batchContracts.push(application.address);
    batchPayloads.push(feePayload);
  }

  multiEstimate = await forwarder.batchRelayCall.estimateGas(
    batchContracts,
    batchPayloads
  );
  console.log(`Batch${batchSize} relay: ${multiEstimate}`);
};
