const http = require('http');
const ganache = require("ganache-core");
const Web3 = require('web3');

const KOVAN_PROVIDER_URL = 'https://kovan.infura.io/v3/85fe482e0db94cbeb9020e7173a481f7';

const app = http.createServer( async (request, response) => {
  console.log('Initializing provider');
  const provider = ganache.provider({
    'fork': KOVAN_PROVIDER_URL
  });
  const web3 = new Web3(provider);

  console.log('Getting block num');
  const blockNum = await web3.eth.getBlockNumber();

  console.log(`Block num: ${blockNum}`);
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(`${blockNum}`);
  response.end();
});

// TODO: Pull port from env
app.listen(3000);
