# surrogeth-client

surrogeth-client is a lightweight JavaScript library used for interacting with the surrogeth system. It's designed to be easy for mixers or wallets to integrate quickly.

## Installation

```
npm install surrogeth-client
```

## Usage

```javascript
import { SurrogethClient } from "surrogeth-client";

const relayerIP = await client.getBestRelayerIP();
// Interact with relayer running surrogethd
```

For a working VueJS app using surrogeth-client, check out the [example app](https://github.com/lsankar4033/surrogeth/tree/master/client/example).
