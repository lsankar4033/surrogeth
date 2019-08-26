/**
 * File for misc utility testing
 */

const { createForkedWeb3, simulateTx } = require('./ethereum');
const { RELAYER_PRIVATE_KEY } = require('./config');

const timeSimulateTx = async (rpcUrl) => {
  const forkedWeb3 = createForkedWeb3(rpcUrl);
  const toAddress = '0xCc233E89Aa99082bbEC2bf6DE8Bf75A103090489';
  const data = '';
  const value = 10;

  let start = new Date()
  let res = await simulateTx(forkedWeb3, toAddress, data, value, RELAYER_PRIVATE_KEY);
  let executionTime = new Date() - start;

  console.info('Execution time: %dms', executionTime)

  return res;
}

module.exports = {
  timeSimulateTx
}
