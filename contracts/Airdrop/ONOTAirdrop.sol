pragma solidity ^0.5.16;

import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ONOTAirdrop is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    uint256 public starttime;

    event Unpack(address indexed user, uint256 amount);

    IERC20 public Lemd;
    uint256 id = 1;
    mapping(address=>uint256) public airdropList;
    constructor(address _lemd, uint256 _starttime) public{
        starttime = _starttime;
        Lemd = IERC20(_lemd);
    }

    modifier checkStart() {
        require(block.timestamp >= starttime, 'Not start');
        _;
    }

    function getUser(address _userAddress) public view returns (uint256) {
        return airdropList[_userAddress];
    }

    function unpack(bytes32 _ga) public  checkStart returns(uint256){
        require(airdropList[msg.sender] == 0, "Already got!");
        require(keccak256(abi.encodePacked(msg.sender)) == _ga, "Error!");
        uint256 amount = importSeedFromThirdSalt(2000000000000000000,id,block.difficulty).add(1000000000000000000);
        require(Lemd.balanceOf(address(this)) > amount, "Empty!");
        Lemd.safeTransfer(msg.sender, amount);
        airdropList[msg.sender] = amount;
        id = id.add(1);
         emit Unpack(msg.sender, amount);
    }

    function importSeedFromThirdSalt( uint256 upper, uint256 seed, uint256 salt) public view returns (uint256) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, seed, salt)));
        return randomNumber % upper;
    }

}
