pragma experimental ABIEncoderV2;
pragma solidity ^0.5.10;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./RelayerReputation.sol";

contract RelayerForwarder is Ownable {
    using SafeMath for uint256;

    RelayerReputation public reputation;

    struct Fraction {
        uint256 numerator;
        uint256 denominator;
    }

    constructor() public {}

    function _relayCall(
        address _applicationContract,
        bytes memory _encodedPayload
    ) internal returns (uint256 fee) {
        // feePlusBurn calculated by the increase in balance of this contract
        uint256 prevBalance = address(this).balance;
        (bool success,) = _applicationContract.call(_encodedPayload);
        require(success, "RelayerForwarder: failure calling application contract");
        uint256 finalBalance = address(this).balance;

        if (finalBalance > prevBalance) {
            fee = finalBalance.sub(prevBalance);
        } else {
            fee = 0;
        }

        return fee;
    }

    /**
     * Enables sending Ether to this contract
     */
    function () external payable {}

    /**
     * Sets the reputation contract.
     *
     * @param _reputationAddress The address of the reputation contract to set.
     */
    function setReputation(address _reputationAddress) external onlyOwner {
        require(address(reputation) == address(0), "RelayerForwarder: Can only set the reputation contract once");

        reputation = RelayerReputation(_reputationAddress);
    }

    /**
     * Calls an application contract and updates registry accordingly. It's assumed that the
     * application contract sends back any fees to this contract
     *
     * @param _applicationContract The application contract to call
     * @param _encodedPayload Payload to call _applicationContract with. Must be encoded as with
     *                        abi.encodePacked to properly work with .call
     */
    function relayCall(
        address _applicationContract,
        bytes calldata _encodedPayload
    ) external {
        require(address(reputation) != address(0), "RelayerForwarder: reputation contract must be set to relay calls");

        require(tx.origin == msg.sender, "RelayerForwarder: cannot relay calls from another contract");

        uint256 fee = _relayCall(_applicationContract, _encodedPayload);

        address payable relayer = msg.sender;
        if (fee > 0) {
            relayer.transfer(fee);
        }
        reputation.logRelay(relayer);
    }

    /**
     * Calls multiple application contracts and updates registry accordingly.
     *
     * @param _applicationContracts The application contracts to call.
     * @param _encodedPayloads Payloads to call each contract in _applicationContract with. Must be encoded as
     *                         with abi.encodePacked.
     */
    function batchRelayCall(
        address[] calldata _applicationContracts,
        bytes[] calldata _encodedPayloads
    ) external {
        require(address(reputation) != address(0), "RelayerForwarder: reputation contract must be set to relay calls");

        require(tx.origin == msg.sender, "RelayerForwarder: cannot relay calls from another contract");

        require(
            _applicationContracts.length == _encodedPayloads.length,
            "RelayerForwarder: must send an equal number of application contracts and encoded payloads"
        );

        address payable relayer = msg.sender;
        uint256 totalRelayerFee = 0;
        for (uint i = 0; i < _applicationContracts.length; i++) {
            uint256 fee = _relayCall(_applicationContracts[i], _encodedPayloads[i]);

            totalRelayerFee += fee;
            reputation.logRelay(relayer);
        }

        relayer.transfer(totalRelayerFee);
    }
}
