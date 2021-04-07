pragma solidity ^0.6.12;

import '@openzeppelin/contracts/math/Math.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import './IRewardDistributionRecipient.sol';


contract TokenWrapper {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function stake(uint256 amount) public payable virtual {
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        if(address(token) != address(0)) {
            token.safeTransferFrom(msg.sender, address(this), amount);
        }
    }

    function withdraw(uint256 amount) public virtual {
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        if(address(token) == address(0)) {
            safeTransferETH(msg.sender, amount);
        } else {
            token.safeTransfer(msg.sender, amount);
        }
        
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, 'ETH_TRANSFER_FAILED');
    }
}

interface IERC20Decimals {
    function decimals() external pure returns (uint256);
}

contract OKTPool is TokenWrapper, IRewardDistributionRecipient {
    IERC20 public Lemd;
    uint256 public DURATION = 10 days; 
    uint256 public decimals = 18;
    uint256 public starttime;
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public maximum;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public deposits;
    mapping(address => address[]) public invites;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(
        address Lemd_,
        address token_,
        uint256 starttime_
    ) public {
        Lemd = IERC20(Lemd_);
        token = IERC20(token_);
        starttime = starttime_;
        if(token_ != address(0)) {
            decimals = IERC20Decimals(token_).decimals();
        }
        maximum = 100 * (10 ** decimals);
    }

    modifier checkStart() {
        require(block.timestamp >= starttime, 'Not start');
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function initialize(uint256 starttime_, uint256 maximum_) public onlyOwner {
        starttime = starttime_;
        maximum = maximum_;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    function earned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stake(uint256 amount)
        public
        payable
        override
        updateReward(msg.sender)
        checkStart
    {
        if(address(token) == address(0)) {
            amount = msg.value;
        }
        require(amount > 0, 'Cannot stake 0');
        uint256 newDeposit = deposits[msg.sender].add(amount);
        require(
            newDeposit <= maximum,
            'Deposit amount exceeds maximum'
        );
        deposits[msg.sender] = newDeposit;
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }


    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stakeETH(address inviter)
        public
        payable
        updateReward(msg.sender)
        checkStart
    {
        require(msg.value > 0, 'Cannot stake 0');
        require(address(token) == address(0), 'Invalid token');
        uint256 newDeposit = deposits[msg.sender].add(msg.value);
        require(
            newDeposit <= maximum.add( invites[inviter].length * 100 * (10 ** 18) ),
            'Deposit amount exceeds maximum'
        );
        deposits[msg.sender] = newDeposit;
        super.stake(msg.value);
        if(inviter != address(0) && inviter != msg.sender  && invites[inviter].length <= 3){
            bool alreadyHave = false;
            for(uint256 i = 0 ; i < invites[inviter].length; i++){
                if(invites[inviter][i] == inviter){
                    alreadyHave = true;
                }
            }
            if(!alreadyHave){
                invites[inviter].push(msg.sender);
            }
        }
        emit Staked(msg.sender, msg.value);
    }

    function getTotalInviteCount(address inviter) public view returns (uint256) {
        return invites[inviter].length;
    }

    function withdraw(uint256 amount)
        public
        override
        updateReward(msg.sender)
        checkStart
    {
        require(amount > 0, 'Cannot withdraw 0');
        deposits[msg.sender] = deposits[msg.sender].sub(amount);
        super.withdraw(amount);
        getReward();
        emit Withdrawn(msg.sender, amount);
    }

    function exit() external {
        withdraw(balanceOf(msg.sender));
        getReward();
    }

    function getReward() public updateReward(msg.sender) checkStart {
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            rewards[msg.sender] = 0;
            Lemd.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function notifyRewardAmount(uint256 reward)
        external
        override
        onlyRewardDistribution
        updateReward(address(0))
    {
        if (block.timestamp > starttime) {
            if (block.timestamp >= periodFinish) {
                rewardRate = reward.div(DURATION);
            } else {
                uint256 remaining = periodFinish.sub(block.timestamp);
                uint256 leftover = remaining.mul(rewardRate);
                rewardRate = reward.add(leftover).div(DURATION);
            }
            lastUpdateTime = block.timestamp;
            periodFinish = block.timestamp.add(DURATION);
            emit RewardAdded(reward);
        } else {
            rewardRate = reward.div(DURATION);
            lastUpdateTime = starttime;
            periodFinish = starttime.add(DURATION);
            emit RewardAdded(reward);
        }
    }
}
