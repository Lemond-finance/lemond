// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../token/LemdToken.sol";

// funding holder. Will call by gnosis-safe
contract FundingHolder is Ownable {

    // The LemdToken !
    LemdToken public lemd;

    constructor(LemdToken _lemd) public {
        lemd = _lemd;
    }

    // only owner can call this function.
    function transfer(address _to, uint256 _amount) public onlyOwner {
        uint256 lemdBal = lemd.balanceOf(address(this));
        if (_amount > lemdBal) {
            lemd.transfer(_to, lemdBal);
        } else {
            lemd.transfer(_to, _amount);
        }
    }

}
