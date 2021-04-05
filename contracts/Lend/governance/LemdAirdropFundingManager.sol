// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

interface ILemdBreeder {
    function stake(uint256 _pid, uint256 _amount) external;

    function unStake(uint256 _pid, uint256 _amount) external;

    function claim(uint256 _pid) external;

    function emergencyWithdraw(uint256 _pid) external;
}

contract LemdAirdropFundingManager is OwnableUpgradeSafe {

    IERC20 public lemd;
    IERC20 public token;
    ILemdBreeder public lemdBreeder;

    event StakeTokenToLemdBreeder(IERC20 token, uint pid, uint amount);
    event UnStakeTokenFromLemdBreeder(IERC20 token, uint pid, uint amount);
    event ClaimLemdFromLemdBreeder(uint pid);


    function initialize(IERC20 _token, IERC20 _lemd, ILemdBreeder _lemdBreeder) public initializer {

        token = _token;
        lemd = _lemd;
        lemdBreeder = _lemdBreeder;

        super.__Ownable_init();
    }

    function _stakeTokenToLemdBreeder(uint pid) public onlyOwner {
        uint amount = token.balanceOf(address(this));
        token.approve(address(lemdBreeder), amount);
        lemdBreeder.stake(pid, amount);
        emit StakeTokenToLemdBreeder(token, pid, amount);
    }

    function _unStakeTokenFromLemdBreeder(uint pid, uint amount) public onlyOwner {
        lemdBreeder.unStake(pid, amount);
        emit UnStakeTokenFromLemdBreeder(token, pid, amount);
    }

    function _claimLemdFromLemdBreeder(uint pid) public onlyOwner {
        lemdBreeder.claim(pid);
        emit ClaimLemdFromLemdBreeder(pid);
    }

    // only owner can call this function.
    function _transferLemd(address _to, uint256 _amount) public onlyOwner {
        uint256 lemdBal = lemd.balanceOf(address(this));
        if (_amount > lemdBal) {
            lemd.transfer(_to, lemdBal);
        } else {
            lemd.transfer(_to, _amount);
        }
    }

}
