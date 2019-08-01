pragma solidity ^0.5.0;

contract Registry {

    uint256 public minBurn;

    constructor(uint256 _minBurn) public {
        minBurn = _minBurn;
    }

    // 'Reputation' maps
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

    /**
     * Calls an application contract and updates relayer reputation accordingly. msg.value is taken to be the
     * 'burn' applied by this relayer
     *
     * @param _applicationContract The application contract to call
     * @param _encodedPayload Payload to call _applicationContract with. Must be encoded as with
     *                        abi.encodePacked to properly work with .call
     */
    function relayCall(
        address _applicationContract,
        bytes calldata _encodedPayload
    ) external payable {
        uint256 burnValue = msg.value;
        require(burnValue >= minBurn, "Registry: relayer must burn at least minBurn wei");

        // Update all state about this relayer
        address relayer = msg.sender;
        if (relayerToRelayCount[relayer] == 0) {
            _addRelayer(relayer);
        }
        relayerToBurn[relayer] += burnValue;
        relayerToRelayCount[relayer] += 1;

        (bool success,) = _applicationContract.call(_encodedPayload);
        require(success, "Registry: failure calling application contract");
    }
}
