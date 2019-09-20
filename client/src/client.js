const ethers = require("ethers");

const getProvider = web3 => {
  const provider = new ethers.providers.Web3Provider(web3.currentProvider);
  return provider;
};
