require("dotenv").config();

const envVars = [
  "PORT",
  "KOVAN_RPC_URL",
  "MAINNET_RPC_URL",
  "LOCAL_RPC_URL",
  "SURROGETH_PRIVATE_KEY",

  // default fee (in Wei) broadcast by this relayer
  "SURROGETH_FEE",

  // minimum profit per tx (in Wei) to consider submitting it. should be notably higher
  // than SURROGETH_FEE
  "SURROGETH_MIN_TX_PROFIT",
  // minimum profit per ERC20 tx (in smallest token unites) to consider
  // submitting it. should be notably higher than SURROGETH_FEE
  "SURROGETH_ERC20_MIN_TX_PROFIT"
];

const arrayEnvVars = ["KOVAN_ALLOWED_RECIPIENTS", "MAINNET_ALLOWED_RECIPIENTS"];

let e = {};
for (const envVar of envVars) {
  e[envVar] = process.env[envVar];
}

for (const arrayEnvVar of arrayEnvVars) {
  if (process.env[arrayEnvVar] === "") {
    e[arrayEnvVar] = [];
  } else {
    e[arrayEnvVar] = process.env[arrayEnvVar].split(" ");
  }
}

module.exports = e;
