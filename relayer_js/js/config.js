require('dotenv').config();

module.exports = {
  RPC_URL: process.env.RPC_URL || 'https://kovan.infura.io/v3/85fe482e0db94cbeb9020e7173a481f7',
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  ADDRESS: process.env.ADDRESS, // NOTE: Technically this is redundant with PRIVATE_KEY
  DEFAULT_GAS_LIMIT: 100000 // TODO: hone in on this?
}
