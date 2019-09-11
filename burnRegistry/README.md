# Surrogeth Burn Registry

The Burn Registry is a set of contracts that serve as a discovery mechanism for reliable surrogeth nodes.
Think of it as a low-touch reputation system. It's the direct evolution of the ideas presented [here](https://ethresear.ch/t/burn-relay-registry-decentralized-transaction-abstraction-on-layer-2/5820).

The `RelayerReputation` and `ERC20RelayerReputation` contracts keep track of reputation for relayers identified by [locator](https://github.com/lsankar4033/surrogeth/blob/master/burnRegistry/contracts/RelayerReputation.sol#L14).

The `RelayerForwarder` and `ERC20RelayerForwarder` are dapp-agnostic forwarder contracts that interact with downstream dapps and update their corresponding `Reputation` contracts based on what surrogeth relayers burn.
