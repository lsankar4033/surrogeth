require("dotenv").config();

const envVars = [
  "KOVAN_RPC_URL",
  "MAINNET_RPC_URL",
  "LOCAL_RPC_URL",
  "SURROGETH_PRIVATE_KEY",
  "SURROGETH_MIN_TX_PROFIT" // minimum profit per tx (in Wei) to consider submitting it
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
