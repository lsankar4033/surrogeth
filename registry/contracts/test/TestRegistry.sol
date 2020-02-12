pragma solidity ^0.5.10;

contract TestRegistry {
    mapping(uint256 => address) public idxToRelayer;
    uint256 public curIdx = 0;

    constructor() public {}

    function logRelay(address _relayer) public {
        idxToRelayer[curIdx] = _relayer;
        curIdx += 1;
    }
}
