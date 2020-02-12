# Surrogeth

Surrogeth is a general [meta-transaction](https://medium.com/@austin_48503/ethereum-meta-transactions-90ccf0859e84)
that uses frontrunners as relayers network. It's designed to support any case where an Ethereum dapp's users
shouldn't be paying the gas costs for their transactions.

It was originally built to support [MicroMix](https://micromix.app), but we're hoping it can support other applications in the future!

## Contents

Surrogeth consists of three components. Build instructions for each exist in its respective directory:

| component                                                                     | description                                                                                     |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [surrogethd](https://github.com/lsankar4033/surrogeth/tree/master/surrogethd) | The surrogeth daemon, a node server that anyone can run to contribute to the Surrogeth network. |
| [registry](https://github.com/lsankar4033/surrogeth/tree/master/registry)     | A trustless discovery mechanism for Surrogeth nodes.                                            |
| [client](https://github.com/lsankar4033/surrogeth/tree/master/client)         | Client-side lib for integrating your app with Surrogeth.                                        |
