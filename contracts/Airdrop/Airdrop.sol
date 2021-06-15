pragma solidity >=0.5.16;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ILemd.sol";
import "hardhat/console.sol";

contract Airdrop is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    ILemd public token;
    uint256 ticketID = 1;
    uint256 public totalAmount = 0;
    mapping(address=>uint256) public amounts;
    mapping(address=>uint256) public tickets;

    constructor(address _token) public{
        token = ILemd(_token);
    }

    function getAirdrop() public returns(uint256){
        require(tickets[msg.sender] == 0, "Have to attend.");
        require(totalAmount >= 45000 ** 18, "Have to attend.");
        uint256 amount = 0;
        amount = (importSeedFromThird(9**18,block.difficulty).add(1**18));
        tickets[msg.sender] = ticketID;
        amounts[msg.sender] = amount;
        console.log(amount,ticketID);
        ticketID = ticketID.add(1);
        totalAmount = totalAmount.add(amount);
        if(totalAmount >= 45000 ** 18){
            
        }
        return ticketID;
    }

    function importSeedFromThird(uint256 upper, uint256 seed) public view returns (uint256) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, seed))) ;
        return randomNumber % upper;
    }

    function getPrize() public {
        require(tickets[msg.sender] != 0, "Did not attend");
        token.mint(msg.sender, amounts[msg.sender]);
    }

}