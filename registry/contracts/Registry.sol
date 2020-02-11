pragma solidity ^0.5.10;

contract Registry {
    address public forwarderAddress;

    event RelayLogged(address indexed _relayer);
    event RelayerLocatorSet(address indexed _relayer);

    /**
     * Information that allows clients to reach a relayer. Not all relayers here will have a locator
     */
    struct RelayerLocator {
        string locator;     // i.e. Tor or IP address
        string locatorType; // i.e. 'tor' or 'ip'
    }
    mapping(address => RelayerLocator) public relayerToLocator;

    /**
     * Dynamic list of relayers. Client code is expected to use these lists to enumerate relayers or check for
     * their presence.
     */
    struct Relayers {
        uint256 count;
        mapping(uint256 => address) list;  // for enumeration
        mapping(address => bool) set;      // for checking membership
    }

    Relayers public allRelayers;
    Relayers public locatorRelayers; // i.e. relayers with a locator. expected to be a subset of allRelayers

    mapping(address => uint256) public relayerToRelayCount;

    constructor(address _forwarderAddress) public {
        forwarderAddress = _forwarderAddress;
    }

    function _attemptAddRelayer(address _relayer, Relayers storage _relayers) internal {
        // Don't do anything if the relayer's already been added
        if (!_relayers.set[_relayer]) {
            _relayers.set[_relayer] = true;
            _relayers.count += 1;
            _relayers.list[_relayers.count] = _relayer;
        }
    }

    /**
     * Throws if called by any account other than the forwarder.
     */
    modifier onlyForwarder() {
        require(msg.sender == forwarderAddress, "Registry: caller is not the forwarder");
        _;
    }

    /**
     * Updates the locator for the specified relayer address. Can only be called from that address (to prevent
     * anyone from griefing a relayer by changing its locator). Frontrunners can use this method to broadcast
     * a locator on which they can be reached.
     *
     * @param _relayer The relayer whose locator to update
     * @param _locator The new locator to set
     * @param _locatorType The locator type to use
     */
    function setRelayerLocator(address _relayer, string calldata _locator, string calldata _locatorType) external {
        require(_relayer == msg.sender, "Registry: can only set the locator for self");

        _attemptAddRelayer(_relayer, allRelayers);
        _attemptAddRelayer(_relayer, locatorRelayers);

        relayerToLocator[_relayer] = RelayerLocator(
            _locator,
            _locatorType
        );

        emit RelayerLocatorSet(_relayer);
    }

    /**
     * Updates reputation maps for the specified relayer and burn value. If this is the first time we're
     * seeing the specified relayer, also adds the relayer to relevant lists.
     *
     * @param _relayer The relayer whose reputation to update
     */
    function logRelay(address _relayer) external onlyForwarder {
        _attemptAddRelayer(_relayer, allRelayers);

        relayerToRelayCount[_relayer] += 1;

        emit RelayLogged(_relayer);
    }
}
