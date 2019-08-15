/**
 * File for misc utility testing
 */

const { createForkedWeb3, simulateTx } = require('./ethereum');
const { PRIVATE_KEY, KOVAN_RPC_URL, MAINNET_RPC_URL } = require('./config');

const timeSimulateTx = async () => {
  const forkedWeb3 = createForkedWeb3(MAINNET_RPC_URL);
  const toAddress = '0xCc233E89Aa99082bbEC2bf6DE8Bf75A103090489';
  const data = '';
  const value = 10;

  let start = new Date()
  await simulateTx(forkedWeb3, toAddress, data, value, PRIVATE_KEY);
  let executionTime = new Date() - start;

  console.info('Execution time: %dms', executionTime)
}

module.exports = {
  timeSimulateTx
}
