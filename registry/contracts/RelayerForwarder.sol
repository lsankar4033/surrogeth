pragma solidity 0.5.10;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./RelayerReputation.sol";

contract RelayerForwarder is Ownable {
    address payable constant burnAddress = address(0);

    uint256 public minBurn;
    RelayerReputation public reputation;

    constructor(uint256 _minBurn) public {
        minBurn = _minBurn;
    }

    /**
     * Sends all balance accrued in this contract to the burn address (0x0).
     */
    function burnBalance() external {
        burnAddress.transfer(address(this).balance);
    }

    /**
     * Sets the reputation contract.
     *
     * @param _reputationAddress The address of the reputation contract to set.
     */
    function setReputation(address _reputationAddress) external {
        reputation = RelayerReputation(_reputationAddress);
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
        require(address(reputation) != address(0), "RelayerForwarder: reputation must be set to relay calls");

        uint256 burnValue = msg.value;
        require(burnValue >= minBurn, "RelayerForwarder: relayer must burn at least minBurn wei");

        address relayer = msg.sender;
        reputation.updateReputation(relayer, burnValue);

        (bool success,) = _applicationContract.call(_encodedPayload);
        require(success, "RelayerForwarder: failure calling application contract");
    }
}
