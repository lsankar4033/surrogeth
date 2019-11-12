# surrogethd

surrogethd is a piece of code anyone can run to act as a surrogeth node offering meta-transaction service. We've designed the code to be simple enough for anyone with access to a command line to run with minimal configuration.

## Setup

First, clone the repo and `cd` into this directory:

```
$ git@github.com:lsankar4033/surrogeth.git
$ cd surrogeth/surrogethd
```

### Env

Whether you're deploying surrogethd as a production instance or just running it for local development and testing, you need to setup a local file containing your env variables. First, create a file called `.env`:

```
$ touch .env
```

Then, add the following configuration variables to this file. You must specify a value for each of them:

```
SURROGETH_PRIVATE_KEY=0x.............................
LOCAL_RPC_URL=...............
KOVAN_RPC_URL=...............
MAINNET_RPC_URL=...............
SURROGETH_MIN_TX_PROFIT=...
SURROGETH_ERC20_MIN_TX_PROFIT='{"0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0": 1000000000000000000}'
SURROGETH_FEE=...
KOVAN_ALLOWED_RECIPIENTS=0x............................. 0x.............................
MAINNET_ALLOWED_RECIPIENTS=0x.............................
```

See below table for descriptions:

| var                           | description                                                                                                                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SURROGETH_PRIVATE_KEY         | hex string representing the private key from which this relayer sends transactions.                                                                                                                                                                                                                                               |
| LOCAL_RPC_URL                 | URL of the RPC endpoint used to interact with the local network. I.e. Ganache RPC URL.                                                                                                                                                                                                                                            |
| KOVAN_RPC_URL                 | URL of the RPC endpoint used to interact with the Kovan network. I.e. Infura or Geth/Parity RPC URL.                                                                                                                                                                                                                              |
| MAINNET_RPC_URL               | URL of the RPC endpoint used to interact with Ethereum mainnet. I.e. Infura or Geth/Parity RPC URL.                                                                                                                                                                                                                               |
| SURROGETH_MIN_TX_PROFIT       | The minimum profit in Wei that this relayer must get from a transaction to actually relay it. If a transaction is submitted to this relayer that nets the relayer less profit than this value, the relayer will reject it.                                                                                                        |
| SURROGETH_ERC20_MIN_TX_PROFIT | The minimum profit in the smallest token unit that this relayer must get from a transaction to actually relay it. If a transaction is submitted to this relayer that nets the relayer less profit than this value, the relayer will reject it. This should be a JSON representation of an object {token address: minimum profit}. |
| SURROGETH_FEE                 | The fee to broadcast to clients                                                                                                                                                                                                                                                                                                   |
| KOVAN_ALLOWED_RECIPIENTS      | Space-delimited list of allowed contract addresses this relayer will relay for on Kovan. If left blank, it's assumed that all contracts are allowed.                                                                                                                                                                              |
| MAINNET_ALLOWED_RECIPIENTS    | Space-delimited list of allowed contract addresses this relayer will relay for on Mainnet. If left blank, it's assumed that all contracts are allowed.                                                                                                                                                                            |

### Running for Production Deployment

First, make sure you've set up a proper `.env` file.

The relayer is deployed as a single Docker container. To start, check out the [Docker docs](https://docs.docker.com) and install Docker.

Once Docker's been installed, `cd` to `surrogethd` wherever you've cloned this repository and build the Dockerfile:

```
$ docker build .
...
Successfully built $CONTAINER_ID
```

Now, run the container by its container ID, specifying the previously created env file and the port from which you want this service to be accessed:

```
$ docker run --env-file .env -p $YOUR_PORT_HERE:8080 $YOUR_CONTAINER_ID_HERE
```

To check that the service is running as expected, try hitting it:

```
$ curl localhost:$YOUR_PORT_HERE/address
{"address":"0x.........."}
```

### Running for Local Development

First, make sure you've set up a proper `.env` file.

Now, install nodejs (> v10.0.0) and npm however you prefer.

Next, install all dependencies:

```
$ npm i
```

Then, run the server:

```
$ npm start

...

Listening on port 8080
```

Finally, check that the server is running as expected:

```
$ curl localhost:8080/address
{"address":"0x.........."}
```

### Testing

surrogethd's tests are written using [jest](https://jestjs.io/en/). Run them with npm:

```
npm run test
```
