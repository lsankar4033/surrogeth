pragma solidity ^0.5.10;

contract TestRegistry {
    mapping(uint256 => address) public idxToRelayer;
    mapping(uint256 => uint256) public idxToFee;

    uint256 public curIdx = 0;

    constructor() public {}

    function logRelay(address _relayer, uint256 _fee) public {
        idxToRelayer[curIdx] = _relayer;
        idxToFee[curIdx] =  _fee;
        curIdx += 1;
    }
}
