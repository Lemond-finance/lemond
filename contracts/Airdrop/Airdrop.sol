pragma solidity >=0.5.16;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ILemd.sol";

contract Airdrop is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    ILemd public token;
    uint256 public starttime;
    uint256 ticketID = 1;
    uint256 public totalAmount = 0;
    mapping(address=>uint256) public amounts;
    mapping(uint256=>address) public tickets;
    mapping(address=>uint256) public ticketIDs;
    uint256[] public prizeArr = [500, 200, 100, 10, 5, 1];
    uint256[] public prizeRank1;
    uint256[] public prizeRank2;
    uint256[] public prizeRank3;
    uint256[] public prizeRank4;
    uint256[] public prizeRank5;
    uint256[] public prizeRank6;

    constructor(address _token, uint256 _starttime) public{
        token = ILemd(_token);
        starttime = _starttime;
    }

    function getTotalNumberTicketID() public returns(uint256) {
        return ticketID;
    }

    function setStartTime(uint256 _starttime) public onlyOwner{
        starttime = _starttime;
    }

    function getAirdrop() public returns(uint256){
        require(amounts[msg.sender] == 0, "Have to attend.");
        require(totalAmount <= 45000 * 10 ** 18, "The airdrop is end.");
        uint256 amount = 0;
        amount = (importSeedFromThird(9 * 10 **18,block.difficulty).add(1 * 10 **18));
        tickets[ticketID] = msg.sender;
        ticketIDs[msg.sender] = ticketID;
        amounts[msg.sender] = amount;
        ticketID = ticketID.add(1);
        totalAmount = totalAmount.add(amount);
        if(totalAmount >= 45000 * 10 ** 18){
            if(prizeArr[0] != 0){
                uint256 rand =  importSeedFromThird(1000,block.difficulty);
                if(rand <= 1){
                    prizeArr[0] = prizeArr[0].sub(1);
                    prizeRank1.push(ticketID);
                }
            }else if(prizeArr[1] != 0){
                 uint256 rand =  importSeedFromThird(2500,block.difficulty);
                if(rand <= 1){
                    prizeArr[1] = prizeArr[1].sub(1);
                    prizeRank2.push(ticketID);
                }
            }else if(prizeArr[2] != 0){
                 uint256 rand =  importSeedFromThird(5000,block.difficulty);
                if(rand <= 1){
                    prizeArr[2] = prizeArr[2].sub(1);
                    prizeRank3.push(ticketID);
                }
            }else if(prizeArr[3] != 0){
                 uint256 rand =  importSeedFromThird(50000,block.difficulty);
                if(rand <= 1){
                    prizeArr[3] = prizeArr[3].sub(1);
                    prizeRank4.push(ticketID);
                }
            }else if(prizeArr[4] != 0){
                 uint256 rand =  importSeedFromThird(100000,block.difficulty);
                if(rand <= 1){
                    prizeArr[4] = prizeArr[4].sub(1);
                    prizeRank5.push(ticketID);
                }
            }else if(prizeArr[5] != 0){
                 uint256 rand =  importSeedFromThird(500000,block.difficulty);
                if(rand <= 1){
                    prizeArr[5] = prizeArr[5].sub(1);
                    prizeRank6.push(ticketID);
                }
            }
        }
        return ticketID;
    }

    function importSeedFromThird(uint256 upper, uint256 seed) public view returns (uint256) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, seed))) ;
        return randomNumber % upper;
    }

    modifier checkStart() {
        require(block.timestamp >= starttime, 'Not start');
        _;
    }

    function getPrize() public checkStart{
        require(amounts[msg.sender] != 0, "Did not attend");
        token.mint(msg.sender, amounts[msg.sender]);
        amounts[msg.sender] = 0;
    }

}