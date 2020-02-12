pragma solidity ^0.5.10;

contract Registry {
    address public forwarderAddress;

    event RelayLogged(address indexed _relayer, uint256 _fee);
    event RelayerLocatorSet(address indexed _relayer);

    constructor(address _forwarderAddress) public {
        forwarderAddress = _forwarderAddress;
    }

    /**
     * Information that allows clients to reach a relayer. Not all relayers here will have a locator
     */
    struct RelayerLocator {
        string locator;     // i.e. Tor or IP address
        string locatorType; // i.e. 'tor' or 'ip'
    }
    mapping(address => RelayerLocator) public relayerToLocator;

    struct FeeAgg {
        uint256 feeSum;
        uint256 feeCount;
    }
    mapping(address => FeeAgg) public relayerToFeeAgg;

    /**
     * Dynamic list of relayers. Client code is expected to use these lists to enumerate relayers or check for
     * their presence.
     */
    struct Relayers {
        uint256 count;
        mapping(uint256 => address) list;  // for enumeration
        mapping(address => bool) set;      // for checking membership
    }
    enum RelayersType {
        All,
        WithLocator
    }

    // TODO: rename to 'relayers'. To contrast with 'broadcasters'
    Relayers public allRelayers;

    // TODO: rename to 'broadcasters'
    Relayers public locatorRelayers; // i.e. relayers with a locator. expected to be a subset of allRelayers

    function _getRelayers(RelayersType _type) internal view returns (Relayers storage) {
        if (_type == RelayersType.WithLocator) {
            return locatorRelayers;
        } else {
            return allRelayers;
        }
    }

    /**
     * Getter for num relayers of a given RelayersType
     */
    function relayersCount(RelayersType _type) external view returns (uint256) {
        Relayers storage relayers = _getRelayers(_type);
        return relayers.count;
    }

    /**
     * Getter for relayer address by index of a given RelayersType.
     */
    function relayerByIdx(RelayersType _type, uint256 _idx) external view returns (address) {
        Relayers storage relayers = _getRelayers(_type);
        return relayers.list[_idx];
    }

    /**
     * Getter for existence boolean of relayer address of a given RelayersType
     */
    function relayerExists(RelayersType _type, address _relayer) external view returns (bool) {
        Relayers storage relayers = _getRelayers(_type);
        return relayers.set[_relayer];
    }

    function _attemptAddRelayer(RelayersType _type, address _relayer) internal {
        Relayers storage relayers = _getRelayers(_type);
        // Don't do anything if the relayer's already been added
        if (!relayers.set[_relayer]) {
            relayers.set[_relayer] = true;
            relayers.list[relayers.count] = _relayer;
            relayers.count += 1;
        }
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

        _attemptAddRelayer(RelayersType.All, _relayer);
        _attemptAddRelayer(RelayersType.WithLocator, _relayer);

        relayerToLocator[_relayer] = RelayerLocator(
            _locator,
            _locatorType
        );

        emit RelayerLocatorSet(_relayer);
    }

    /**
     * Throws if called by any account other than the forwarder.
     */
    modifier onlyForwarder() {
        require(msg.sender == forwarderAddress, "Registry: caller is not the forwarder");
        _;
    }

    /**
     * Updates reputation maps for the specified relayer and burn value. If this is the first time we're
     * seeing the specified relayer, also adds the relayer to relevant lists.
     *
     * @param _relayer The relayer whose reputation to update
     */
    function logRelay(address _relayer, uint256 _fee) external onlyForwarder {
        _attemptAddRelayer(RelayersType.All, _relayer);

        FeeAgg memory feeAgg = relayerToFeeAgg[_relayer];
        relayerToFeeAgg[_relayer] = FeeAgg(
            feeAgg.feeSum + _fee,
            feeAgg.feeCount + 1
        );

        emit RelayLogged(_relayer, _fee);
    }
}
