pragma solidity 0.5.10;

contract TestApplication {
    uint256 public fee;

    constructor(uint256 _fee) public {
        fee = _fee;
    }

    uint256 public value = 0;

    function noFeeAdd(uint256 _toAdd) external {
        value += _toAdd;
    }

    function feeAdd(uint256 _toAdd) external {
        address payable sender = msg.sender;
        value += _toAdd;
        sender.transfer(fee);
    }

    function feePayload() external pure returns (bytes memory) {
        uint256 num = 5;
        return abi.encodePacked(bytes4(keccak256("feeAdd(uint256)")), num);
    }

    function noFeePayload() external pure returns (bytes memory) {
        uint256 num = 5;
        return abi.encodePacked(bytes4(keccak256("noFeeAdd(uint256)")), num);
    }

    // NOTE: To enable funding this contract in tests
    function () external payable {}
}
