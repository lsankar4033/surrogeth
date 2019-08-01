pragma solidity ^0.5.0;

// TODO: docstrings
contract Registry {

    uint256 public minBurn;

    constructor(uint256 _minBurn) public {
        minBurn = _minBurn;
    }

    mapping(address => uint256) public relayerToBurn;
    mapping(address => uint256) public relayerToRelayCount;

    // Clients can enumerate relayerList using nextRelayer and then reference relayerToBurn and
    // relayerToRelayCount to determine wnich relayer(s) to use
    mapping(uint256 => address) public relayerList;
    uint256 public nextRelayer = 1;

    function _addRelayer(address relayer) internal {
        relayerList[nextRelayer] = relayer;
        nextRelayer += 1;
    }

    function relayCall(
        address _applicationContract,
        bytes calldata _encodedCallData
    ) external payable {
        uint256 burnValue = msg.value;
        require(burnValue >= minBurn, "Registry: relayer must burn at least minBurn wei");

        address relayer = msg.sender;
        if (relayerToRelayCount[relayer] == 0) {
            _addRelayer(relayer);
        }
        relayerToBurn[relayer] += burnValue;
        relayerToRelayCount[relayer] += 1;

        (bool success,) = _applicationContract.call(_encodedCallData);
        require(success, "Registry: failure calling application contract");
    }
}
