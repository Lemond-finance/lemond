pragma solidity 0.6.12;

interface IFlashloan {
    function flashloan(address _lToken, address _receiver, address _reserve, uint256 _amount, bytes memory _params) external;
}
