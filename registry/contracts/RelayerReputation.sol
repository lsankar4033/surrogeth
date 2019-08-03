pragma solidity ^0.5.0;

contract RelayerReputation {

    event RelayerAdded(address indexed _relayer);
    event ReputationUpdated(address indexed _relayer, uint256 _burnValue);

    address public forwarderAddress;

    // 'Reputation' maps
    mapping(address => uint256) public relayerToBurn;
    mapping(address => uint256) public relayerToRelayCount;

    // Clients can enumerate relayerList using nextRelayer and then reference relayerToBurn and
    // relayerToRelayCount to determine wnich relayer(s) to use
    mapping(uint256 => address) public relayerList;
    uint256 public nextRelayer = 1;

    constructor(address _forwarderAddress) public {
        forwarderAddress = _forwarderAddress;
    }

    /**
     * Throws if called by any account other than the forwarder.
     */
    modifier onlyForwarder() {
        require(msg.sender == forwarderAddress, "RelayerReputation: caller is not the forwarder");
        _;
    }

    function _addRelayer(address _relayer) internal {
        relayerList[nextRelayer] = _relayer;
        nextRelayer += 1;
        emit RelayerAdded(_relayer);
    }

    /**
     * Updates reputation maps for the specified relayer and burn value. If this is the first time we're
     * seeing the specified relayer, also adds the relayer to relevant lists.
     *
     * @param _relayer The relayer whose reputation to update
     * @param _burnValue The amount of wei burned by the specified relayer
     */
    function updateReputation(address _relayer, uint256 _burnValue) external {
        if (relayerToRelayCount[_relayer] == 0) {
            _addRelayer(_relayer);
        }

        relayerToBurn[_relayer] += _burnValue;
        relayerToRelayCount[_relayer] += 1;
        emit ReputationUpdated(_relayer, _burnValue);
    }
}
