pragma solidity ^0.5.0;

contract TestApplication {
    uint256 public value = 0;

    function add(uint256 _toAdd) external {
        value += _toAdd;
    }
}
