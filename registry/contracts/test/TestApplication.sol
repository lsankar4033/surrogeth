pragma solidity 0.5.10;

contract TestApplication {
    uint256 public value = 0;

    function add(uint256 _toAdd) external {
        value += _toAdd;
    }

    function sampleEncodedPayload() external pure returns (bytes memory) {
        uint256 num = 5;
        return abi.encodePacked(bytes4(keccak256("add(uint256)")), num);
    }
}
