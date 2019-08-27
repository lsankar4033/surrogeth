# Generalized relayer

The generalized relayer is a piece of code anyone can run to act as a relayer offering transaction abstraction services. We've designed the code to be simple enough for anyone with access to a command line to run with minimal configuration.

## Setup

First, clone the repo and `cd` into this directory:

```
$ git@github.com:lsankar4033/micromix_relayer.git
$ cd micromix_relayer/relayer 
```

### Env

Whether you're deploying the relayer as a production instance or just running it for local development and testing, you need to setup a local file containing your env variables. First, create a file called `.env`:

```
$ touch .env
```

Then, add the following configuration variables to this file. You must specify a value for each of them:

```
RELAYER_PRIVATE_KEY=0x.............................
KOVAN_RPC_URL=...............
MAINNET_RPC_URL=...............
RELAYER_MIN_TX_PROFIT=...
```
Descriptions:

**RELAYER\_PRIVATE\_KEY** - hex string representing the private key from which this relayer sends transactions.

**KOVAN\_RPC\_URL** - URL of the RPC endpoint used to interact with the Kovan network. I.e. Infura or Geth/Parity RPC URL.


**MAINNET\_RPC\_URL** - URL of the RPC endpoint used to interact with Ethereum mainnet. I.e. Infura or Geth/Parity RPC URL.


**RELAYER\_MIN\_TX\_PROFIT** - The minimum profit in Wei that this relayer must get from a transaction to actually relay it. If a transaction is submitted to this relayer that nets the relayer less profit than this value, the relayer will reject it.

### Deployment
First, make sure you've set up a proper `.env` file.

The relayer is deployed as a single Docker container. To start, check out the [Docker docs](https://docs.docker.com) and install Docker.

Once Docker's been installed, `cd` to `relayer` wherever you've cloned this repository and build the Dockerfile:

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

### Development
TODO

### Testing
TODO
