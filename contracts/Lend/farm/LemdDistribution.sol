pragma solidity 0.6.12;

import "../libs/Exponential.sol";
import "../token/LToken.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "../comptroller/ComptrollerStorage.sol";
import "../comptroller/Comptroller.sol";
import "../comptroller/ComptrollerStorage.sol";

interface ILemdDistribution {

    function distributeMintLemd(address lToken, address minter, bool distributeAll) external;

    function distributeRedeemLemd(address lToken, address redeemer, bool distributeAll) external;

    function distributeBorrowLemd(address lToken, address borrower, bool distributeAll) external;

    function distributeRepayBorrowLemd(address lToken, address borrower, bool distributeAll) external;

    function distributeSeizeLemd(address lTokenCollateral, address borrower, address liquidator, bool distributeAll) external;

    function distributeTransferLemd(address lToken, address src, address dst, bool distributeAll) external;

}

interface ILemdBreeder {
    function stake(uint256 _pid, uint256 _amount) external;

    function unStake(uint256 _pid, uint256 _amount) external;

    function claim(uint256 _pid) external;

    function emergencyWithdraw(uint256 _pid) external;
}

contract LemdDistribution is ILemdDistribution, Exponential, OwnableUpgradeSafe {

    IERC20 public lemd;

    ILemdBreeder public lemdBreeder;

    Comptroller public comptroller;

    //LEMD-MODIFY: Copy and modify from ComptrollerV3Storage

    struct LemdMarketState {
        /// @notice The market's last updated compBorrowIndex or compSupplyIndex
        uint224 index;

        /// @notice The block number the index was last updated at
        uint32 block;
    }

    /// @notice The portion of compRate that each market currently receives
    mapping(address => uint) public lemdSpeeds;

    /// @notice The LEMD market supply state for each market
    mapping(address => LemdMarketState) public lemdSupplyState;

    /// @notice The LEMD market borrow state for each market
    mapping(address => LemdMarketState) public lemdBorrowState;

    /// @notice The LEMD borrow index for each market for each supplier as of the last time they accrued LEMD
    mapping(address => mapping(address => uint)) public lemdSupplierIndex;

    /// @notice The LEMD borrow index for each market for each borrower as of the last time they accrued LEMD
    mapping(address => mapping(address => uint)) public lemdBorrowerIndex;

    /// @notice The LEMD accrued but not yet transferred to each user
    mapping(address => uint) public lemdAccrued;

    /// @notice The threshold above which the flywheel transfers LEMD, in wei
    uint public constant lemdClaimThreshold = 0.001e18;

    /// @notice The initial LEMD index for a market
    uint224 public constant lemdInitialIndex = 1e36;

    bool public enableLemdClaim;
    bool public enableDistributeMintLemd;
    bool public enableDistributeRedeemLemd;
    bool public enableDistributeBorrowLemd;
    bool public enableDistributeRepayBorrowLemd;
    bool public enableDistributeSeizeLemd;
    bool public enableDistributeTransferLemd;


    /// @notice Emitted when a new LEMD speed is calculated for a market
    event LemdSpeedUpdated(LToken indexed lToken, uint newSpeed);

    /// @notice Emitted when LEMD is distributed to a supplier
    event DistributedSupplierLemd(LToken indexed lToken, address indexed supplier, uint lemdDelta, uint lemdSupplyIndex);

    /// @notice Emitted when LEMD is distributed to a borrower
    event DistributedBorrowerLemd(LToken indexed lToken, address indexed borrower, uint lemdDelta, uint lemdBorrowIndex);

    event StakeTokenToLemdBreeder(IERC20 token, uint pid, uint amount);

    event ClaimLemdFromLemdBreeder(uint pid);

    event EnableState(string action, bool state);

    function initialize(IERC20 _lemd, ILemdBreeder _lemdBreeder, Comptroller _comptroller) public initializer {

        lemd = _lemd;
        lemdBreeder = _lemdBreeder;
        comptroller = _comptroller;

        enableLemdClaim = false;
        enableDistributeMintLemd = false;
        enableDistributeRedeemLemd = false;
        enableDistributeBorrowLemd = false;
        enableDistributeRepayBorrowLemd = false;
        enableDistributeSeizeLemd = false;
        enableDistributeTransferLemd = false;

        super.__Ownable_init();
    }

    function distributeMintLemd(address lToken, address minter, bool distributeAll) public override(ILemdDistribution) {
        require(msg.sender == address(comptroller) || msg.sender == owner(), "only comptroller or owner");
        if (enableDistributeMintLemd) {
            updateLemdSupplyIndex(lToken);
            distributeSupplierLemd(lToken, minter, distributeAll);
        }
    }

    function distributeRedeemLemd(address lToken, address redeemer, bool distributeAll) public override(ILemdDistribution) {
        require(msg.sender == address(comptroller) || msg.sender == owner(), "only comptroller or owner");
        if (enableDistributeRedeemLemd) {
            updateLemdSupplyIndex(lToken);
            distributeSupplierLemd(lToken, redeemer, distributeAll);
        }
    }

    function distributeBorrowLemd(address lToken, address borrower, bool distributeAll) public override(ILemdDistribution) {

        require(msg.sender == address(comptroller) || msg.sender == owner(), "only comptroller or owner");

        if (enableDistributeBorrowLemd) {
            Exp memory borrowIndex = Exp({mantissa : LToken(lToken).borrowIndex()});
            updateLemdBorrowIndex(lToken, borrowIndex);
            distributeBorrowerLemd(lToken, borrower, borrowIndex, distributeAll);
        }


    }

    function distributeRepayBorrowLemd(address lToken, address borrower, bool distributeAll) public override(ILemdDistribution) {

        require(msg.sender == address(comptroller) || msg.sender == owner(), "only comptroller or owner");

        if (enableDistributeRepayBorrowLemd) {
            Exp memory borrowIndex = Exp({mantissa : LToken(lToken).borrowIndex()});
            updateLemdBorrowIndex(lToken, borrowIndex);
            distributeBorrowerLemd(lToken, borrower, borrowIndex, distributeAll);
        }

    }

    function distributeSeizeLemd(address lTokenCollateral, address borrower, address liquidator, bool distributeAll) public override(ILemdDistribution) {

        require(msg.sender == address(comptroller) || msg.sender == owner(), "only comptroller or owner");

        if (enableDistributeSeizeLemd) {
            updateLemdSupplyIndex(lTokenCollateral);
            distributeSupplierLemd(lTokenCollateral, borrower, distributeAll);
            distributeSupplierLemd(lTokenCollateral, liquidator, distributeAll);
        }

    }

    function distributeTransferLemd(address lToken, address src, address dst, bool distributeAll) public override(ILemdDistribution) {

        require(msg.sender == address(comptroller) || msg.sender == owner(), "only comptroller or owner");

        if (enableDistributeTransferLemd) {
            updateLemdSupplyIndex(lToken);
            distributeSupplierLemd(lToken, src, distributeAll);
            distributeSupplierLemd(lToken, dst, distributeAll);
        }

    }

    function _stakeTokenToLemdBreeder(IERC20 token, uint pid) public onlyOwner {
        uint amount = token.balanceOf(address(this));
        token.approve(address(lemdBreeder), amount);
        lemdBreeder.stake(pid, amount);
        emit StakeTokenToLemdBreeder(token, pid, amount);
    }

    function _claimLemdFromLemdBreeder(uint pid) public onlyOwner {
        lemdBreeder.claim(pid);
        emit ClaimLemdFromLemdBreeder(pid);
    }

    function setLemdSpeedInternal(LToken lToken, uint lemdSpeed) internal {
        uint currentLemdSpeed = lemdSpeeds[address(lToken)];
        if (currentLemdSpeed != 0) {
            // note that LEMD speed could be set to 0 to halt liquidity rewards for a market
            Exp memory borrowIndex = Exp({mantissa : lToken.borrowIndex()});
            updateLemdSupplyIndex(address(lToken));
            updateLemdBorrowIndex(address(lToken), borrowIndex);
        } else if (lemdSpeed != 0) {

            require(comptroller.isMarketListed(address(lToken)), "lemd market is not listed");

            if (comptroller.isMarketMinted(address(lToken)) == false) {
                comptroller._setMarketMinted(address(lToken), true);
            }

            if (lemdSupplyState[address(lToken)].index == 0 && lemdSupplyState[address(lToken)].block == 0) {
                lemdSupplyState[address(lToken)] = LemdMarketState({
                index : lemdInitialIndex,
                block : safe32(block.number, "block number exceeds 32 bits")
                });
            }

            if (lemdBorrowState[address(lToken)].index == 0 && lemdBorrowState[address(lToken)].block == 0) {
                lemdBorrowState[address(lToken)] = LemdMarketState({
                index : lemdInitialIndex,
                block : safe32(block.number, "block number exceeds 32 bits")
                });
            }

        }

        if (currentLemdSpeed != lemdSpeed) {
            lemdSpeeds[address(lToken)] = lemdSpeed;
            emit LemdSpeedUpdated(lToken, lemdSpeed);
        }

    }

    /**
     * @notice Accrue LEMD to the market by updating the supply index
     * @param lToken The market whose supply index to update
     */
    function updateLemdSupplyIndex(address lToken) internal {
        LemdMarketState storage supplyState = lemdSupplyState[lToken];
        uint supplySpeed = lemdSpeeds[lToken];
        uint blockNumber = block.number;
        uint deltaBlocks = sub_(blockNumber, uint(supplyState.block));
        if (deltaBlocks > 0 && supplySpeed > 0) {
            uint supplyTokens = LToken(lToken).totalSupply();
            uint lemdAccrued = mul_(deltaBlocks, supplySpeed);
            Double memory ratio = supplyTokens > 0 ? fraction(lemdAccrued, supplyTokens) : Double({mantissa : 0});
            Double memory index = add_(Double({mantissa : supplyState.index}), ratio);
            lemdSupplyState[lToken] = LemdMarketState({
            index : safe224(index.mantissa, "new index exceeds 224 bits"),
            block : safe32(blockNumber, "block number exceeds 32 bits")
            });
        } else if (deltaBlocks > 0) {
            supplyState.block = safe32(blockNumber, "block number exceeds 32 bits");
        }
    }

    /**
     * @notice Accrue LEMD to the market by updating the borrow index
     * @param lToken The market whose borrow index to update
     */
    function updateLemdBorrowIndex(address lToken, Exp memory marketBorrowIndex) internal {
        LemdMarketState storage borrowState = lemdBorrowState[lToken];
        uint borrowSpeed = lemdSpeeds[lToken];
        uint blockNumber = block.number;
        uint deltaBlocks = sub_(blockNumber, uint(borrowState.block));
        if (deltaBlocks > 0 && borrowSpeed > 0) {
            uint borrowAmount = div_(LToken(lToken).totalBorrows(), marketBorrowIndex);
            uint lemdAccrued = mul_(deltaBlocks, borrowSpeed);
            Double memory ratio = borrowAmount > 0 ? fraction(lemdAccrued, borrowAmount) : Double({mantissa : 0});
            Double memory index = add_(Double({mantissa : borrowState.index}), ratio);
            lemdBorrowState[lToken] = LemdMarketState({
            index : safe224(index.mantissa, "new index exceeds 224 bits"),
            block : safe32(blockNumber, "block number exceeds 32 bits")
            });
        } else if (deltaBlocks > 0) {
            borrowState.block = safe32(blockNumber, "block number exceeds 32 bits");
        }
    }

    /**
     * @notice Calculate LEMD accrued by a supplier and possibly transfer it to them
     * @param lToken The market in which the supplier is interacting
     * @param supplier The address of the supplier to distribute LEMD to
     */
    function distributeSupplierLemd(address lToken, address supplier, bool distributeAll) internal {
        LemdMarketState storage supplyState = lemdSupplyState[lToken];
        Double memory supplyIndex = Double({mantissa : supplyState.index});
        Double memory supplierIndex = Double({mantissa : lemdSupplierIndex[lToken][supplier]});
        lemdSupplierIndex[lToken][supplier] = supplyIndex.mantissa;
        if (supplierIndex.mantissa == 0 && supplyIndex.mantissa > 0) {
            supplierIndex.mantissa = lemdInitialIndex;
        }
        Double memory deltaIndex = sub_(supplyIndex, supplierIndex);
        uint supplierTokens = LToken(lToken).balanceOf(supplier);
        uint supplierDelta = mul_(supplierTokens, deltaIndex);
        uint supplierAccrued = add_(lemdAccrued[supplier], supplierDelta);
        lemdAccrued[supplier] = grantLemdInternal(supplier, supplierAccrued, distributeAll ? 0 : lemdClaimThreshold);
        emit DistributedSupplierLemd(LToken(lToken), supplier, supplierDelta, supplyIndex.mantissa);
    }


    /**
     * @notice Calculate LEMD accrued by a borrower and possibly transfer it to them
     * @dev Borrowers will not begin to accrue until after the first interaction with the protocol.
     * @param lToken The market in which the borrower is interacting
     * @param borrower The address of the borrower to distribute LEMD to
     */
    function distributeBorrowerLemd(address lToken, address borrower, Exp memory marketBorrowIndex, bool distributeAll) internal {
        LemdMarketState storage borrowState = lemdBorrowState[lToken];
        Double memory borrowIndex = Double({mantissa : borrowState.index});
        Double memory borrowerIndex = Double({mantissa : lemdBorrowerIndex[lToken][borrower]});
        lemdBorrowerIndex[lToken][borrower] = borrowIndex.mantissa;

        if (borrowerIndex.mantissa > 0) {
            Double memory deltaIndex = sub_(borrowIndex, borrowerIndex);
            uint borrowerAmount = div_(LToken(lToken).borrowBalanceStored(borrower), marketBorrowIndex);
            uint borrowerDelta = mul_(borrowerAmount, deltaIndex);
            uint borrowerAccrued = add_(lemdAccrued[borrower], borrowerDelta);
            lemdAccrued[borrower] = grantLemdInternal(borrower, borrowerAccrued, distributeAll ? 0 : lemdClaimThreshold);
            emit DistributedBorrowerLemd(LToken(lToken), borrower, borrowerDelta, borrowIndex.mantissa);
        }
    }


    /**
     * @notice Transfer LEMD to the user, if they are above the threshold
     * @dev Note: If there is not enough LEMD, we do not perform the transfer all.
     * @param user The address of the user to transfer LEMD to
     * @param userAccrued The amount of LEMD to (possibly) transfer
     * @return The amount of LEMD which was NOT transferred to the user
     */
    function grantLemdInternal(address user, uint userAccrued, uint threshold) internal returns (uint) {

        if (userAccrued >= threshold && userAccrued > 0) {
            uint lemdRemaining = lemd.balanceOf(address(this));
            if (userAccrued <= lemdRemaining) {
                lemd.transfer(user, userAccrued);
                return 0;
            }
        }
        return userAccrued;
    }

    /**
     * @notice Claim all the lemd accrued by holder in all markets
     * @param holder The address to claim LEMD for
     */
    function claimLemd(address holder) public {
        claimLemd(holder, comptroller.getAllMarkets());
    }

    /**
     * @notice Claim all the comp accrued by holder in the specified markets
     * @param holder The address to claim LEMD for
     * @param lTokens The list of markets to claim LEMD in
     */
    function claimLemd(address holder, LToken[] memory lTokens) public {
        address[] memory holders = new address[](1);
        holders[0] = holder;
        claimLemd(holders, lTokens, true, true);
    }

    /**
     * @notice Claim all lemd accrued by the holders
     * @param holders The addresses to claim LEMD for
     * @param lTokens The list of markets to claim LEMD in
     * @param borrowers Whether or not to claim LEMD earned by borrowing
     * @param suppliers Whether or not to claim LEMD earned by supplying
     */
    function claimLemd(address[] memory holders, LToken[] memory lTokens, bool borrowers, bool suppliers) public {
        require(enableLemdClaim, "Claim is not enabled");

        for (uint i = 0; i < lTokens.length; i++) {
            LToken lToken = lTokens[i];
            require(comptroller.isMarketListed(address(lToken)), "market must be listed");
            if (borrowers == true) {
                Exp memory borrowIndex = Exp({mantissa : lToken.borrowIndex()});
                updateLemdBorrowIndex(address(lToken), borrowIndex);
                for (uint j = 0; j < holders.length; j++) {
                    distributeBorrowerLemd(address(lToken), holders[j], borrowIndex, true);
                }
            }
            if (suppliers == true) {
                updateLemdSupplyIndex(address(lToken));
                for (uint j = 0; j < holders.length; j++) {
                    distributeSupplierLemd(address(lToken), holders[j], true);
                }
            }
        }

    }

    /*** LEMD Distribution Admin ***/

    function _setLemdSpeed(LToken lToken, uint lemdSpeed) public onlyOwner {
        setLemdSpeedInternal(lToken, lemdSpeed);
    }

    function _setEnableLemdClaim(bool state) public onlyOwner {
        enableLemdClaim = state;
        emit EnableState("enableLemdClaim", state);
    }

    function _setEnableDistributeMintLemd(bool state) public onlyOwner {
        enableDistributeMintLemd = state;
        emit EnableState("enableDistributeMintLemd", state);
    }

    function _setEnableDistributeRedeemLemd(bool state) public onlyOwner {
        enableDistributeRedeemLemd = state;
        emit EnableState("enableDistributeRedeemLemd", state);
    }

    function _setEnableDistributeBorrowLemd(bool state) public onlyOwner {
        enableDistributeBorrowLemd = state;
        emit EnableState("enableDistributeBorrowLemd", state);
    }

    function _setEnableDistributeRepayBorrowLemd(bool state) public onlyOwner {
        enableDistributeRepayBorrowLemd = state;
        emit EnableState("enableDistributeRepayBorrowLemd", state);
    }

    function _setEnableDistributeSeizeLemd(bool state) public onlyOwner {
        enableDistributeSeizeLemd = state;
        emit EnableState("enableDistributeSeizeLemd", state);
    }

    function _setEnableDistributeTransferLemd(bool state) public onlyOwner {
        enableDistributeTransferLemd = state;
        emit EnableState("enableDistributeTransferLemd", state);
    }

    function _setEnableAll(bool state) public onlyOwner {
        _setEnableDistributeMintLemd(state);
        _setEnableDistributeRedeemLemd(state);
        _setEnableDistributeBorrowLemd(state);
        _setEnableDistributeRepayBorrowLemd(state);
        _setEnableDistributeSeizeLemd(state);
        _setEnableDistributeTransferLemd(state);
        _setEnableLemdClaim(state);
    }

    function _transferLemd(address to, uint amount) public onlyOwner {
        _transferToken(address(lemd), to, amount);
    }

    function _transferToken(address token, address to, uint amount) public onlyOwner {
        IERC20 erc20 = IERC20(token);

        uint balance = erc20.balanceOf(address(this));
        if (balance < amount) {
            amount = balance;
        }

        erc20.transfer(to, amount);
    }

    function pendingLemdAccrued(address holder, bool borrowers, bool suppliers) public view returns (uint256){
        return pendingLemdInternal(holder, borrowers, suppliers);
    }

    function pendingLemdInternal(address holder, bool borrowers, bool suppliers) internal view returns (uint256){

        uint256 pendingLemd = lemdAccrued[holder];

        LToken[] memory lTokens = comptroller.getAllMarkets();
        for (uint i = 0; i < lTokens.length; i++) {
            address lToken = address(lTokens[i]);
            uint tmp = 0;
            if (borrowers == true) {
                tmp = pendingLemdBorrowInternal(holder, lToken);
                pendingLemd = add_(pendingLemd, tmp);
            }
            if (suppliers == true) {
                tmp = pendingLemdSupplyInternal(holder, lToken);
                pendingLemd = add_(pendingLemd, tmp);
            }
        }

        return pendingLemd;
    }

    function pendingLemdBorrowInternal(address borrower, address lToken) internal view returns (uint256){
        if (enableDistributeBorrowLemd && enableDistributeRepayBorrowLemd) {
            Exp memory marketBorrowIndex = Exp({mantissa : LToken(lToken).borrowIndex()});
            LemdMarketState memory borrowState = pendingLemdBorrowIndex(lToken, marketBorrowIndex);

            Double memory borrowIndex = Double({mantissa : borrowState.index});
            Double memory borrowerIndex = Double({mantissa : lemdBorrowerIndex[lToken][borrower]});
            if (borrowerIndex.mantissa > 0) {
                Double memory deltaIndex = sub_(borrowIndex, borrowerIndex);
                uint borrowerAmount = div_(LToken(lToken).borrowBalanceStored(borrower), marketBorrowIndex);
                uint borrowerDelta = mul_(borrowerAmount, deltaIndex);
                return borrowerDelta;
            }
        }
        return 0;
    }

    function pendingLemdBorrowIndex(address lToken, Exp memory marketBorrowIndex) internal view returns (LemdMarketState memory){
        LemdMarketState memory borrowState = lemdBorrowState[lToken];
        uint borrowSpeed = lemdSpeeds[lToken];
        uint blockNumber = block.number;
        uint deltaBlocks = sub_(blockNumber, uint(borrowState.block));
        if (deltaBlocks > 0 && borrowSpeed > 0) {
            uint borrowAmount = div_(LToken(lToken).totalBorrows(), marketBorrowIndex);
            uint lemdAccrued = mul_(deltaBlocks, borrowSpeed);
            Double memory ratio = borrowAmount > 0 ? fraction(lemdAccrued, borrowAmount) : Double({mantissa : 0});
            Double memory index = add_(Double({mantissa : borrowState.index}), ratio);
            borrowState = LemdMarketState({
            index : safe224(index.mantissa, "new index exceeds 224 bits"),
            block : safe32(blockNumber, "block number exceeds 32 bits")
            });
        } else if (deltaBlocks > 0) {
            borrowState = LemdMarketState({
            index : borrowState.index,
            block : safe32(blockNumber, "block number exceeds 32 bits")
            });
        }
        return borrowState;
    }

    function pendingLemdSupplyInternal(address supplier, address lToken) internal view returns (uint256){
        if (enableDistributeMintLemd && enableDistributeRedeemLemd) {
            LemdMarketState memory supplyState = pendingLemdSupplyIndex(lToken);
            Double memory supplyIndex = Double({mantissa : supplyState.index});
            Double memory supplierIndex = Double({mantissa : lemdSupplierIndex[lToken][supplier]});
            if (supplierIndex.mantissa == 0 && supplyIndex.mantissa > 0) {
                supplierIndex.mantissa = lemdInitialIndex;
            }
            Double memory deltaIndex = sub_(supplyIndex, supplierIndex);
            uint supplierTokens = LToken(lToken).balanceOf(supplier);
            uint supplierDelta = mul_(supplierTokens, deltaIndex);
            return supplierDelta;
        }
        return 0;
    }

    function pendingLemdSupplyIndex(address lToken) internal view returns (LemdMarketState memory){
        LemdMarketState memory supplyState = lemdSupplyState[lToken];
        uint supplySpeed = lemdSpeeds[lToken];
        uint blockNumber = block.number;
        uint deltaBlocks = sub_(blockNumber, uint(supplyState.block));

        if (deltaBlocks > 0 && supplySpeed > 0) {
            uint supplyTokens = LToken(lToken).totalSupply();
            uint lemdAccrued = mul_(deltaBlocks, supplySpeed);
            Double memory ratio = supplyTokens > 0 ? fraction(lemdAccrued, supplyTokens) : Double({mantissa : 0});
            Double memory index = add_(Double({mantissa : supplyState.index}), ratio);
            supplyState = LemdMarketState({
            index : safe224(index.mantissa, "new index exceeds 224 bits"),
            block : safe32(blockNumber, "block number exceeds 32 bits")
            });
        } else if (deltaBlocks > 0) {
            supplyState = LemdMarketState({
            index : supplyState.index,
            block : safe32(blockNumber, "block number exceeds 32 bits")
            });
        }
        return supplyState;
    }

}