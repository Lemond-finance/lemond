// COPIED FROM https://github.com/compound-finance/compound-protocol/blob/master/contracts/Comptroller.sol
//Copyright 2020 Compound Labs, Inc.
//Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
//1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
//2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
//3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./ComptrollerStorage.sol";
import "./IComptroller.sol";
import "../libs/ErrorReporter.sol";
import "../libs/Exponential.sol";
import "../token/LToken.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "../farm/LemdDistribution.sol";

//LEMD-MODIFY: Modified some methods and fields according to WeLemd's business logic
contract Comptroller is ComptrollerStorage, IComptroller, ComptrollerErrorReporter, Exponential, OwnableUpgradeSafe {

    // @notice Emitted when an admin supports a market
    event MarketListed(LToken lToken);

    // @notice Emitted when an account enters a market
    event MarketEntered(LToken lToken, address account);

    // @notice Emitted when an account exits a market
    event MarketExited(LToken lToken, address account);

    // @notice Emitted when close factor is changed by admin
    event NewCloseFactor(uint oldCloseFactorMantissa, uint newCloseFactorMantissa);

    // @notice Emitted when a collateral factor is changed by admin
    event NewCollateralFactor(LToken lToken, uint oldCollateralFactorMantissa, uint newCollateralFactorMantissa);

    // @notice Emitted when liquidation incentive is changed by admin
    event NewLiquidationIncentive(uint oldLiquidationIncentiveMantissa, uint newLiquidationIncentiveMantissa);

    // @notice Emitted when maxAssets is changed by admin
    event NewMaxAssets(uint oldMaxAssets, uint newMaxAssets);

    // @notice Emitted when price oracle is changed
    event NewPriceOracle(IPriceOracle oldPriceOracle, IPriceOracle newPriceOracle);

    // @notice Emitted when pause guardian is changed
    event NewPauseGuardian(address oldPauseGuardian, address newPauseGuardian);

    // @notice Emitted when an action is paused globally
    event ActionPaused(string action, bool pauseState);

    // @notice Emitted when an action is paused on a market
    event ActionPaused(LToken lToken, string action, bool pauseState);

    /// @notice Emitted when borrow cap for a lToken is changed
    event NewBorrowCap(LToken indexed lToken, uint newBorrowCap);

    /// @notice Emitted when borrow cap guardian is changed
    event NewBorrowCapGuardian(address oldBorrowCapGuardian, address newBorrowCapGuardian);

    event NewLemdDistribution(ILemdDistribution oldLemdDistribution, ILemdDistribution newLemdDistribution);

    /// @notice Emitted when mint cap for a lToken is changed
    event NewMintCap(LToken indexed lToken, uint newMintCap);

    // closeFactorMantissa must be strictly greater than this value
    uint internal constant closeFactorMinMantissa = 0.05e18;

    // closeFactorMantissa must not exceed this value
    uint internal constant closeFactorMaxMantissa = 0.9e18;

    // No collateralFactorMantissa may exceed this value
    uint internal constant collateralFactorMaxMantissa = 0.9e18;

    // liquidationIncentiveMantissa must be no less than this value
    uint internal constant liquidationIncentiveMinMantissa = 1.0e18;

    // liquidationIncentiveMantissa must be no greater than this value
    uint internal constant liquidationIncentiveMaxMantissa = 1.5e18;

    // for distribute lemd
    ILemdDistribution lemdDistribution;

    mapping(address => uint256) public mintCaps;

    function initialize() public initializer {

        //setting the msg.sender as the initial owner.
        super.__Ownable_init();
    }


    /*** Assets You Are In ***/

    function enterMarkets(address[] memory lTokens) public override(IComptroller) returns (uint[] memory)  {
        uint len = lTokens.length;

        uint[] memory results = new uint[](len);
        for (uint i = 0; i < len; i++) {
            LToken lToken = LToken(lTokens[i]);
            results[i] = uint(addToMarketInternal(lToken, msg.sender));
        }

        return results;
    }

    /**
     * @notice Add the market to the borrower's "assets in" for liquidity calculations
     * @param lToken The market to enter
     * @param borrower The address of the account to modify
     * @return Success indicator for whether the market was entered
     */
    function addToMarketInternal(LToken lToken, address borrower) internal returns (Error) {
        Market storage marketToJoin = markets[address(lToken)];

        // market is not listed, cannot join
        if (!marketToJoin.isListed) {
            return Error.MARKET_NOT_LISTED;
        }

        // already joined
        if (marketToJoin.accountMembership[borrower] == true) {
            return Error.NO_ERROR;
        }

        // no space, cannot join
        if (accountAssets[borrower].length >= maxAssets) {
            return Error.TOO_MANY_ASSETS;
        }

        marketToJoin.accountMembership[borrower] = true;
        accountAssets[borrower].push(lToken);

        emit MarketEntered(lToken, borrower);

        return Error.NO_ERROR;
    }

    function exitMarket(address lTokenAddress) external override(IComptroller) returns (uint) {
        LToken lToken = LToken(lTokenAddress);

        // Get sender tokensHeld and amountOwed underlying from the lToken
        (uint oErr, uint tokensHeld, uint amountOwed,) = lToken.getAccountSnapshot(msg.sender);
        require(oErr == 0, "exitMarket: getAccountSnapshot failed");

        // Fail if the sender has a borrow balance
        if (amountOwed != 0) {
            return fail(Error.NONZERO_BORROW_BALANCE, FailureInfo.EXIT_MARKET_BALANCE_OWED);
        }

        // Fail if the sender is not permitted to redeem all of their tokens
        uint allowed = redeemAllowedInternal(lTokenAddress, msg.sender, tokensHeld);
        if (allowed != 0) {
            return failOpaque(Error.REJECTION, FailureInfo.EXIT_MARKET_REJECTION, allowed);
        }

        Market storage marketToExit = markets[address(lToken)];

        // Return true if the sender is not already ‘in’ the market
        if (!marketToExit.accountMembership[msg.sender]) {
            return uint(Error.NO_ERROR);
        }

        // Set lToken account membership to false
        delete marketToExit.accountMembership[msg.sender];

        // Delete lToken from the account’s list of assets
        // load into memory for faster iteration
        LToken[] memory userAssetList = accountAssets[msg.sender];
        uint len = userAssetList.length;
        uint assetIndex = len;
        for (uint i = 0; i < len; i++) {
            if (userAssetList[i] == lToken) {
                assetIndex = i;
                break;
            }
        }

        // We *must* have found the asset in the list or our redundant data structure is broken
        assert(assetIndex < len);

        // copy last item in list to location of item to be removed, reduce length by 1
        LToken[] storage storedList = accountAssets[msg.sender];
        storedList[assetIndex] = storedList[storedList.length - 1];
        storedList.pop();

        emit MarketExited(lToken, msg.sender);

        return uint(Error.NO_ERROR);
    }


    /**
    * @notice Returns the assets an account has entered
    * @param account The address of the account to pull assets for
    * @return A dynamic list with the assets the account has entered
    */
    function getAssetsIn(address account) external view returns (LToken[] memory) {
        LToken[] memory assetsIn = accountAssets[account];
        return assetsIn;
    }

    /**
     * @notice Returns whether the given account is entered in the given asset
     * @param account The address of the account to check
     * @param lToken The lToken to check
     * @return True if the account is in the asset, otherwise false.
     */
    function checkMembership(address account, LToken lToken) external view returns (bool) {
        return markets[address(lToken)].accountMembership[account];
    }

    /*** Policy Hooks ***/

    function mintAllowed(address lToken, address minter, uint mintAmount) external override(IComptroller) returns (uint){

        // Pausing is a very serious situation - we revert to sound the alarms
        require(!lTokenMintGuardianPaused[lToken], "mint is paused");

        //Shh - currently unused. It's written here to eliminate compile-time alarms.
        minter;
        mintAmount;

        if (!markets[lToken].isListed) {
            return uint(Error.MARKET_NOT_LISTED);
        }

        uint mintCap = mintCaps[lToken];
        if (mintCap != 0) {
            uint totalSupply = LToken(lToken).totalSupply();
            uint exchangeRate = LToken(lToken).exchangeRateStored();
            (MathError mErr, uint balance) = mulScalarTruncate(Exp({mantissa : exchangeRate}), totalSupply);
            require(mErr == MathError.NO_ERROR, "balance could not be calculated");
            (MathError mathErr, uint nextTotalMints) = addUInt(balance, mintAmount);
            require(mathErr == MathError.NO_ERROR, "total mint amount overflow");
            require(nextTotalMints < mintCap, "market mint cap reached");
        }

        if (distributeLemdPaused == false) {
            lemdDistribution.distributeMintLemd(lToken, minter, false);
        }

        return uint(Error.NO_ERROR);
    }

    function mintVerify(address lToken, address minter, uint mintAmount, uint mintTokens) external override(IComptroller) {

        //Shh - currently unused. It's written here to eliminate compile-time alarms.
        lToken;
        minter;
        mintAmount;
        mintTokens;

    }

    function redeemAllowed(address lToken, address redeemer, uint redeemTokens) external override(IComptroller) returns (uint){

        uint allowed = redeemAllowedInternal(lToken, redeemer, redeemTokens);
        if (allowed != uint(Error.NO_ERROR)) {
            return allowed;
        }

        if (distributeLemdPaused == false) {
            lemdDistribution.distributeRedeemLemd(lToken, redeemer, false);
        }

        return uint(Error.NO_ERROR);
    }

    /**
    * LEMD-MODIFY:
    * @notice Checks if the account should be allowed to redeem tokens in the given market
    * @param lToken The market to verify the redeem against
    * @param redeemer The account which would redeem the tokens
    * @param redeemTokens The number of lTokens to exchange for the underlying asset in the market
    * @return 0 if the redeem is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
    */
    function redeemAllowedInternal(address lToken, address redeemer, uint redeemTokens) internal view returns (uint) {
        if (!markets[lToken].isListed) {
            return uint(Error.MARKET_NOT_LISTED);
        }

        /* If the redeemer is not 'in' the market, then we can bypass the liquidity check */
        if (!markets[lToken].accountMembership[redeemer]) {
            return uint(Error.NO_ERROR);
        }

        /* Otherwise, perform a hypothetical liquidity check to guard against shortfall */
        (Error err, , uint shortfall) = getHypotheticalAccountLiquidityInternal(redeemer, LToken(lToken), redeemTokens, 0);
        if (err != Error.NO_ERROR) {
            return uint(err);
        }
        if (shortfall > 0) {
            return uint(Error.INSUFFICIENT_LIQUIDITY);
        }

        return uint(Error.NO_ERROR);
    }

    function redeemVerify(address lToken, address redeemer, uint redeemAmount, uint redeemTokens) external override(IComptroller) {
        //Shh - currently unused. It's written here to eliminate compile-time alarms.
        lToken;
        redeemer;
        redeemAmount;
        redeemTokens;
    }

    function borrowAllowed(address lToken, address borrower, uint borrowAmount) external override(IComptroller) returns (uint) {

        // Pausing is a very serious situation - we revert to sound the alarms
        require(!lTokenBorrowGuardianPaused[lToken], "borrow is paused");

        if (!markets[lToken].isListed) {
            return uint(Error.MARKET_NOT_LISTED);
        }

        if (!markets[lToken].accountMembership[borrower]) {

            // only lTokens may call borrowAllowed if borrower not in market
            require(msg.sender == lToken, "sender must be lToken");

            // attempt to add borrower to the market
            Error err = addToMarketInternal(LToken(msg.sender), borrower);
            if (err != Error.NO_ERROR) {
                return uint(err);
            }

            // it should be impossible to break the important invariant
            assert(markets[lToken].accountMembership[borrower]);
        }

        if (oracle.getUnderlyingPrice(LToken(lToken)) == 0) {
            return uint(Error.PRICE_ERROR);
        }

        uint borrowCap = borrowCaps[lToken];
        // Borrow cap of 0 corresponds to unlimited borrowing
        if (borrowCap != 0) {
            uint totalBorrows = LToken(lToken).totalBorrows();
            (MathError mathErr, uint nextTotalBorrows) = addUInt(totalBorrows, borrowAmount);
            require(mathErr == MathError.NO_ERROR, "total borrows overflow");
            require(nextTotalBorrows < borrowCap, "market borrow cap reached");
        }

        (Error err, , uint shortfall) = getHypotheticalAccountLiquidityInternal(borrower, LToken(lToken), 0, borrowAmount);
        if (err != Error.NO_ERROR) {
            return uint(err);
        }
        if (shortfall > 0) {
            return uint(Error.INSUFFICIENT_LIQUIDITY);
        }

        //distribute lemd
        if (distributeLemdPaused == false) {
            lemdDistribution.distributeBorrowLemd(lToken, borrower, false);
        }

        return uint(Error.NO_ERROR);

    }

    function borrowVerify(address lToken, address borrower, uint borrowAmount) external override(IComptroller) {
        //Shh - currently unused. It's written here to eliminate compile-time alarms.
        lToken;
        borrower;
        borrowAmount;
    }

    function repayBorrowAllowed(address lToken, address payer, address borrower, uint repayAmount) external override(IComptroller) returns (uint) {

        if (!markets[lToken].isListed) {
            return uint(Error.MARKET_NOT_LISTED);
        }

        // Shh - currently unused. It's written here to eliminate compile-time alarms.
        payer;
        borrower;
        repayAmount;

        //distribute lemd
        if (distributeLemdPaused == false) {
            lemdDistribution.distributeRepayBorrowLemd(lToken, borrower, false);
        }

        return uint(Error.NO_ERROR);
    }

    function repayBorrowVerify(address lToken, address payer, address borrower, uint repayAmount, uint borrowerIndex) external override(IComptroller) {

        // Shh - currently unused. It's written here to eliminate compile-time alarms.
        lToken;
        payer;
        borrower;
        repayAmount;
        borrowerIndex;
    }

    function liquidateBorrowAllowed(
        address lTokenBorrowed,
        address lTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount
    ) external override(IComptroller) returns (uint){

        // Shh - currently unused. It's written here to eliminate compile-time alarms.
        liquidator;

        if (!markets[lTokenBorrowed].isListed || !markets[lTokenCollateral].isListed) {
            return uint(Error.MARKET_NOT_LISTED);
        }

        /* The borrower must have shortfall in order to be liquidatable */
        (Error err, , uint shortfall) = getAccountLiquidityInternal(borrower);
        if (err != Error.NO_ERROR) {
            return uint(err);
        }
        if (shortfall == 0) {
            return uint(Error.INSUFFICIENT_SHORTFALL);
        }

        /* The liquidator may not repay more than what is allowed by the closeFactor */
        uint borrowBalance = LToken(lTokenBorrowed).borrowBalanceStored(borrower);
        (MathError mathErr, uint maxClose) = mulScalarTruncate(Exp({mantissa : closeFactorMantissa}), borrowBalance);
        if (mathErr != MathError.NO_ERROR) {
            return uint(Error.MATH_ERROR);
        }
        if (repayAmount > maxClose) {
            return uint(Error.TOO_MUCH_REPAY);
        }

        return uint(Error.NO_ERROR);
    }

    function liquidateBorrowVerify(
        address lTokenBorrowed,
        address lTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount,
        uint seizeTokens
    ) external override(IComptroller) {

        // Shh - currently unused. It's written here to eliminate compile-time alarms.
        lTokenBorrowed;
        lTokenCollateral;
        liquidator;
        borrower;
        repayAmount;
        seizeTokens;

    }

    function seizeAllowed(
        address lTokenCollateral,
        address lTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens
    ) external override(IComptroller) returns (uint){
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!seizeGuardianPaused, "seize is paused");

        // Shh - currently unused. It's written here to eliminate compile-time alarms.
        seizeTokens;

        if (!markets[lTokenCollateral].isListed || !markets[lTokenBorrowed].isListed) {
            return uint(Error.MARKET_NOT_LISTED);
        }

        if (LToken(lTokenCollateral).comptroller() != LToken(lTokenBorrowed).comptroller()) {
            return uint(Error.COMPTROLLER_MISMATCH);
        }

        //distribute lemd
        if (distributeLemdPaused == false) {
            lemdDistribution.distributeSeizeLemd(lTokenCollateral, borrower, liquidator, false);
        }

        return uint(Error.NO_ERROR);
    }

    function seizeVerify(
        address lTokenCollateral,
        address lTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens
    ) external override(IComptroller) {

        // Shh - currently unused. It's written here to eliminate compile-time alarms.
        lTokenCollateral;
        lTokenBorrowed;
        liquidator;
        borrower;
        seizeTokens;
    }

    function transferAllowed(
        address lToken,
        address src,
        address dst,
        uint transferTokens
    ) external override(IComptroller) returns (uint){
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!transferGuardianPaused, "transfer is paused");

        // Currently the only consideration is whether or not
        //  the src is allowed to redeem this many tokens
        uint allowed = redeemAllowedInternal(lToken, src, transferTokens);
        if (allowed != uint(Error.NO_ERROR)) {
            return allowed;
        }

        //distribute lemd
        if (distributeLemdPaused == false) {
            lemdDistribution.distributeTransferLemd(lToken, src, dst, false);
        }

        return uint(Error.NO_ERROR);
    }

    function transferVerify(
        address lToken,
        address src,
        address dst,
        uint transferTokens
    ) external override(IComptroller) {
        // Shh - currently unused. It's written here to eliminate compile-time alarms.
        lToken;
        src;
        dst;
        transferTokens;
    }

    /*** Liquidity/Liquidation Calculations ***/

    /**
     * @dev Local vars for avoiding stack-depth limits in calculating account liquidity.
     *  Note that `lTokenBalance` is the number of lTokens the account owns in the market,
     *  whereas `borrowBalance` is the amount of underlying that the account has borrowed.
     */
    struct AccountLiquidityLocalVars {
        uint sumCollateral;
        uint sumBorrowPlusEffects;
        uint lTokenBalance;
        uint borrowBalance;
        uint exchangeRateMantissa;
        uint oraclePriceMantissa;
        Exp collateralFactor;
        Exp exchangeRate;
        Exp oraclePrice;
        Exp tokensToDenom;
    }

    /**
     * @notice Determine the current account liquidity wrt collateral requirements
     * @return (possible error code (semi-opaque),
                account liquidity in excess of collateral requirements,
     *          account shortfall below collateral requirements)
     */
    function getAccountLiquidity(address account) public view returns (uint, uint, uint) {
        (Error err, uint liquidity, uint shortfall) = getHypotheticalAccountLiquidityInternal(account, LToken(0), 0, 0);
        return (uint(err), liquidity, shortfall);
    }


    /**
     * @notice Determine the current account liquidity wrt collateral requirements
     * @return (possible error code,
                account liquidity in excess of collateral requirements,
     *          account shortfall below collateral requirements)
     */
    function getAccountLiquidityInternal(address account) internal view returns (Error, uint, uint) {
        return getHypotheticalAccountLiquidityInternal(account, LToken(0), 0, 0);
    }

    /**
     * @notice Determine what the account liquidity would be if the given amounts were redeemed/borrowed
     * @param lTokenModify The market to hypothetically redeem/borrow in
     * @param account The account to determine liquidity for
     * @param redeemTokens The number of tokens to hypothetically redeem
     * @param borrowAmount The amount of underlying to hypothetically borrow
     * @return (possible error code (semi-opaque),
                hypothetical account liquidity in excess of collateral requirements,
     *          hypothetical account shortfall below collateral requirements)
     */
    function getHypotheticalAccountLiquidity(
        address account,
        address lTokenModify,
        uint redeemTokens,
        uint borrowAmount) public view returns (uint, uint, uint) {
        (Error err, uint liquidity, uint shortfall) = getHypotheticalAccountLiquidityInternal(account, LToken(lTokenModify), redeemTokens, borrowAmount);
        return (uint(err), liquidity, shortfall);
    }


    /**
     * @notice Determine what the account liquidity would be if the given amounts were redeemed/borrowed
     * @param account The account to determine liquidity for
     * @param lTokenModify The market to hypothetically redeem/borrow in
     * @param redeemTokens The number of tokens to hypothetically redeem
     * @param borrowAmount The amount of underlying to hypothetically borrow
     * @dev Note that we calculate the exchangeRateStored for each collateral lToken using stored data,
     *  without calculating accumulated interest.
     * @return (possible error code,
                hypothetical account liquidity in excess of collateral requirements,
     *          hypothetical account shortfall below collateral requirements)
     */
    function getHypotheticalAccountLiquidityInternal(
        address account,
        LToken lTokenModify,
        uint redeemTokens,
        uint borrowAmount) internal view returns (Error, uint, uint) {

        AccountLiquidityLocalVars memory vars;
        uint oErr;
        MathError mErr;

        // For each asset the account is in
        LToken[] memory assets = accountAssets[account];
        for (uint i = 0; i < assets.length; i++) {
            LToken asset = assets[i];

            // Read the balances and exchange rate from the lToken
            (oErr, vars.lTokenBalance, vars.borrowBalance, vars.exchangeRateMantissa) = asset.getAccountSnapshot(account);
            if (oErr != 0) {// semi-opaque error code, we assume NO_ERROR == 0 is invariant between upgrades
                return (Error.SNAPSHOT_ERROR, 0, 0);
            }
            vars.collateralFactor = Exp({mantissa : markets[address(asset)].collateralFactorMantissa});
            vars.exchangeRate = Exp({mantissa : vars.exchangeRateMantissa});

            // Get the normalized price of the asset
            vars.oraclePriceMantissa = oracle.getUnderlyingPrice(asset);
            if (vars.oraclePriceMantissa == 0) {
                return (Error.PRICE_ERROR, 0, 0);
            }
            vars.oraclePrice = Exp({mantissa : vars.oraclePriceMantissa});

            // Pre-compute a conversion factor from tokens -> usd (normalized price value)
            // lTokenPrice = oraclePrice * exchangeRate
            (mErr, vars.tokensToDenom) = mulExp3(vars.collateralFactor, vars.exchangeRate, vars.oraclePrice);
            if (mErr != MathError.NO_ERROR) {
                return (Error.MATH_ERROR, 0, 0);
            }

            // sumCollateral += tokensToDenom * lTokenBalance
            (mErr, vars.sumCollateral) = mulScalarTruncateAddUInt(vars.tokensToDenom, vars.lTokenBalance, vars.sumCollateral);
            if (mErr != MathError.NO_ERROR) {
                return (Error.MATH_ERROR, 0, 0);
            }

            // sumBorrowPlusEffects += oraclePrice * borrowBalance
            (mErr, vars.sumBorrowPlusEffects) = mulScalarTruncateAddUInt(vars.oraclePrice, vars.borrowBalance, vars.sumBorrowPlusEffects);
            if (mErr != MathError.NO_ERROR) {
                return (Error.MATH_ERROR, 0, 0);
            }

            // Calculate effects of interacting with lTokenModify
            if (asset == lTokenModify) {
                // redeem effect
                // sumBorrowPlusEffects += tokensToDenom * redeemTokens
                (mErr, vars.sumBorrowPlusEffects) = mulScalarTruncateAddUInt(vars.tokensToDenom, redeemTokens, vars.sumBorrowPlusEffects);
                if (mErr != MathError.NO_ERROR) {
                    return (Error.MATH_ERROR, 0, 0);
                }

                // borrow effect
                // sumBorrowPlusEffects += oraclePrice * borrowAmount
                (mErr, vars.sumBorrowPlusEffects) = mulScalarTruncateAddUInt(vars.oraclePrice, borrowAmount, vars.sumBorrowPlusEffects);
                if (mErr != MathError.NO_ERROR) {
                    return (Error.MATH_ERROR, 0, 0);
                }
            }
        }

        // These are safe, as the underflow condition is checked first
        if (vars.sumCollateral > vars.sumBorrowPlusEffects) {
            return (Error.NO_ERROR, vars.sumCollateral - vars.sumBorrowPlusEffects, 0);
        } else {
            return (Error.NO_ERROR, 0, vars.sumBorrowPlusEffects - vars.sumCollateral);
        }
    }

    function liquidateCalculateSeizeTokens(
        address lTokenBorrowed,
        address lTokenCollateral,
        uint actualRepayAmount
    ) external override(IComptroller) view returns (uint, uint) {
        /* Read oracle prices for borrowed and collateral markets */
        uint priceBorrowedMantissa = oracle.getUnderlyingPrice(LToken(lTokenBorrowed));
        uint priceCollateralMantissa = oracle.getUnderlyingPrice(LToken(lTokenCollateral));
        if (priceBorrowedMantissa == 0 || priceCollateralMantissa == 0) {
            return (uint(Error.PRICE_ERROR), 0);
        }

        /*
        * Get the exchange rate and calculate the number of collateral tokens to seize:
        *  seizeAmount = actualRepayAmount * liquidationIncentive * priceBorrowed / priceCollateral
        *  seizeTokens = seizeAmount / exchangeRate
        *   = actualRepayAmount * (liquidationIncentive * priceBorrowed) / (priceCollateral * exchangeRate)
        *
        * Note: reverts on error
        */
        uint exchangeRateMantissa = LToken(lTokenCollateral).exchangeRateStored();

        uint seizeTokens;
        Exp memory numerator;
        Exp memory denominator;
        Exp memory ratio;
        MathError mathErr;

        (mathErr, numerator) = mulExp(liquidationIncentiveMantissa, priceBorrowedMantissa);
        if (mathErr != MathError.NO_ERROR) {
            return (uint(Error.MATH_ERROR), 0);
        }

        (mathErr, denominator) = mulExp(priceCollateralMantissa, exchangeRateMantissa);
        if (mathErr != MathError.NO_ERROR) {
            return (uint(Error.MATH_ERROR), 0);
        }

        (mathErr, ratio) = divExp(numerator, denominator);
        if (mathErr != MathError.NO_ERROR) {
            return (uint(Error.MATH_ERROR), 0);
        }

        (mathErr, seizeTokens) = mulScalarTruncate(ratio, actualRepayAmount);
        if (mathErr != MathError.NO_ERROR) {
            return (uint(Error.MATH_ERROR), 0);
        }

        return (uint(Error.NO_ERROR), seizeTokens);

    }

    /*** Admin Functions ***/

    /**
      * @notice Sets a new price oracle for the comptroller
      * @dev Admin function to set a new price oracle
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function _setPriceOracle(IPriceOracle newOracle) public onlyOwner returns (uint) {

        // Track the old oracle for the comptroller
        IPriceOracle oldOracle = oracle;

        // Set comptroller's oracle to newOracle
        oracle = newOracle;

        // Emit NewPriceOracle(oldOracle, newOracle)
        emit NewPriceOracle(oldOracle, newOracle);

        return uint(Error.NO_ERROR);
    }

    /**
      * @notice Sets the closeFactor used when liquidating borrows
      * @dev Admin function to set closeFactor
      * @param newCloseFactorMantissa New close factor, scaled by 1e18
      * @return uint 0=success, otherwise a failure. (See ErrorReporter for details)
      */
    function _setCloseFactor(uint newCloseFactorMantissa) external onlyOwner returns (uint) {

        Exp memory newCloseFactorExp = Exp({mantissa : newCloseFactorMantissa});
        Exp memory lowLimit = Exp({mantissa : closeFactorMinMantissa});
        if (lessThanOrEqualExp(newCloseFactorExp, lowLimit)) {
            return fail(Error.INVALID_CLOSE_FACTOR, FailureInfo.SET_CLOSE_FACTOR_VALIDATION);
        }

        Exp memory highLimit = Exp({mantissa : closeFactorMaxMantissa});
        if (lessThanExp(highLimit, newCloseFactorExp)) {
            return fail(Error.INVALID_CLOSE_FACTOR, FailureInfo.SET_CLOSE_FACTOR_VALIDATION);
        }

        uint oldCloseFactorMantissa = closeFactorMantissa;
        closeFactorMantissa = newCloseFactorMantissa;
        emit NewCloseFactor(oldCloseFactorMantissa, closeFactorMantissa);

        return uint(Error.NO_ERROR);
    }

    /**
      * @notice Sets the collateralFactor for a market
      * @dev Admin function to set per-market collateralFactor
      * @param lToken The market to set the factor on
      * @param newCollateralFactorMantissa The new collateral factor, scaled by 1e18
      * @return uint 0=success, otherwise a failure. (See ErrorReporter for details)
      */
    function _setCollateralFactor(LToken lToken, uint newCollateralFactorMantissa) external onlyOwner returns (uint) {

        // Verify market is listed
        Market storage market = markets[address(lToken)];
        if (!market.isListed) {
            return fail(Error.MARKET_NOT_LISTED, FailureInfo.SET_COLLATERAL_FACTOR_NO_EXISTS);
        }

        Exp memory newCollateralFactorExp = Exp({mantissa : newCollateralFactorMantissa});

        // Check collateral factor <= 0.9
        Exp memory highLimit = Exp({mantissa : collateralFactorMaxMantissa});
        if (lessThanExp(highLimit, newCollateralFactorExp)) {
            return fail(Error.INVALID_COLLATERAL_FACTOR, FailureInfo.SET_COLLATERAL_FACTOR_VALIDATION);
        }

        // If collateral factor != 0, fail if price == 0
        if (newCollateralFactorMantissa != 0 && oracle.getUnderlyingPrice(lToken) == 0) {
            return fail(Error.PRICE_ERROR, FailureInfo.SET_COLLATERAL_FACTOR_WITHOUT_PRICE);
        }

        // Set market's collateral factor to new collateral factor, remember old value
        uint oldCollateralFactorMantissa = market.collateralFactorMantissa;
        market.collateralFactorMantissa = newCollateralFactorMantissa;

        // Emit event with asset, old collateral factor, and new collateral factor
        emit NewCollateralFactor(lToken, oldCollateralFactorMantissa, newCollateralFactorMantissa);

        return uint(Error.NO_ERROR);
    }

    /**
      * @notice Sets maxAssets which controls how many markets can be entered
      * @dev Admin function to set maxAssets
      * @param newMaxAssets New max assets
      * @return uint 0=success, otherwise a failure. (See ErrorReporter for details)
      */
    function _setMaxAssets(uint newMaxAssets) external onlyOwner returns (uint) {

        uint oldMaxAssets = maxAssets;
        maxAssets = newMaxAssets;
        emit NewMaxAssets(oldMaxAssets, newMaxAssets);

        return uint(Error.NO_ERROR);
    }

    /**
      * @notice Sets liquidationIncentive
      * @dev Admin function to set liquidationIncentive
      * @param newLiquidationIncentiveMantissa New liquidationIncentive scaled by 1e18
      * @return uint 0=success, otherwise a failure. (See ErrorReporter for details)
      */
    function _setLiquidationIncentive(uint newLiquidationIncentiveMantissa) external onlyOwner returns (uint) {

        // Check de-scaled min <= newLiquidationIncentive <= max
        Exp memory newLiquidationIncentive = Exp({mantissa : newLiquidationIncentiveMantissa});
        Exp memory minLiquidationIncentive = Exp({mantissa : liquidationIncentiveMinMantissa});
        if (lessThanExp(newLiquidationIncentive, minLiquidationIncentive)) {
            return fail(Error.INVALID_LIQUIDATION_INCENTIVE, FailureInfo.SET_LIQUIDATION_INCENTIVE_VALIDATION);
        }

        Exp memory maxLiquidationIncentive = Exp({mantissa : liquidationIncentiveMaxMantissa});
        if (lessThanExp(maxLiquidationIncentive, newLiquidationIncentive)) {
            return fail(Error.INVALID_LIQUIDATION_INCENTIVE, FailureInfo.SET_LIQUIDATION_INCENTIVE_VALIDATION);
        }

        // Save current value for use in log
        uint oldLiquidationIncentiveMantissa = liquidationIncentiveMantissa;

        // Set liquidation incentive to new incentive
        liquidationIncentiveMantissa = newLiquidationIncentiveMantissa;

        // Emit event with old incentive, new incentive
        emit NewLiquidationIncentive(oldLiquidationIncentiveMantissa, newLiquidationIncentiveMantissa);

        return uint(Error.NO_ERROR);
    }

    /**
      * @notice Add the market to the markets mapping and set it as listed
      * @dev Admin function to set isListed and add support for the market
      * @param lToken The address of the market (token) to list
      * @return uint 0=success, otherwise a failure. (See enum Error for details)
      */
    function _supportMarket(LToken lToken) external onlyOwner returns (uint) {

        if (markets[address(lToken)].isListed) {
            return fail(Error.MARKET_ALREADY_LISTED, FailureInfo.SUPPORT_MARKET_EXISTS);
        }

        markets[address(lToken)] = Market({isListed : true, isMinted : false, collateralFactorMantissa : 0});

        _addMarketInternal(address(lToken));

        emit MarketListed(lToken);

        return uint(Error.NO_ERROR);
    }

    function _addMarketInternal(address lToken) internal onlyOwner {
        for (uint i = 0; i < allMarkets.length; i ++) {
            require(allMarkets[i] != LToken(lToken), "market already added");
        }
        allMarkets.push(LToken(lToken));
    }

    /**
      * @notice Set the given borrow caps for the given lToken markets. Borrowing that brings total borrows to or above borrow cap will revert.
      * @dev Admin or borrowCapGuardian function to set the borrow caps. A borrow cap of 0 corresponds to unlimited borrowing.
      * @param lTokens The addresses of the markets (tokens) to change the borrow caps for
      * @param newBorrowCaps The new borrow cap values in underlying to be set. A value of 0 corresponds to unlimited borrowing.
      */
    function _setMarketBorrowCaps(LToken[] calldata lTokens, uint[] calldata newBorrowCaps) external {
        require(msg.sender == owner() || msg.sender == borrowCapGuardian, "only owner or borrow cap guardian can set borrow caps");

        uint numMarkets = lTokens.length;
        uint numBorrowCaps = newBorrowCaps.length;

        require(numMarkets != 0 && numMarkets == numBorrowCaps, "invalid input");

        for (uint i = 0; i < numMarkets; i++) {
            borrowCaps[address(lTokens[i])] = newBorrowCaps[i];
            emit NewBorrowCap(lTokens[i], newBorrowCaps[i]);
        }
    }

    /**
     * @notice Admin function to change the Borrow Cap Guardian
     * @param newBorrowCapGuardian The address of the new Borrow Cap Guardian
     */
    function _setBorrowCapGuardian(address newBorrowCapGuardian) external onlyOwner {

        // Save current value for inclusion in log
        address oldBorrowCapGuardian = borrowCapGuardian;

        // Store borrowCapGuardian with value newBorrowCapGuardian
        borrowCapGuardian = newBorrowCapGuardian;

        // Emit NewBorrowCapGuardian(OldBorrowCapGuardian, NewBorrowCapGuardian)
        emit NewBorrowCapGuardian(oldBorrowCapGuardian, newBorrowCapGuardian);
    }

    /**
     * @notice Admin function to change the Pause Guardian
     * @param newPauseGuardian The address of the new Pause Guardian
     * @return uint 0=success, otherwise a failure. (See enum Error for details)
     */
    function _setPauseGuardian(address newPauseGuardian) public onlyOwner returns (uint) {

        // Save current value for inclusion in log
        address oldPauseGuardian = pauseGuardian;

        // Store pauseGuardian with value newPauseGuardian
        pauseGuardian = newPauseGuardian;

        // Emit NewPauseGuardian(OldPauseGuardian, NewPauseGuardian)
        emit NewPauseGuardian(oldPauseGuardian, pauseGuardian);

        return uint(Error.NO_ERROR);
    }

    function _setMintPaused(LToken lToken, bool state) public returns (bool) {
        require(markets[address(lToken)].isListed, "cannot pause a market that is not listed");
        require(msg.sender == pauseGuardian || msg.sender == owner(), "only pause guardian and owner can pause");
        require(msg.sender == owner() || state == true, "only owner can unpause");

        lTokenMintGuardianPaused[address(lToken)] = state;
        emit ActionPaused(lToken, "Mint", state);
        return state;
    }

    function _setBorrowPaused(LToken lToken, bool state) public returns (bool) {
        require(markets[address(lToken)].isListed, "cannot pause a market that is not listed");
        require(msg.sender == pauseGuardian || msg.sender == owner(), "only pause guardian and owner can pause");
        require(msg.sender == owner() || state == true, "only owner can unpause");

        lTokenBorrowGuardianPaused[address(lToken)] = state;
        emit ActionPaused(lToken, "Borrow", state);
        return state;
    }

    function _setTransferPaused(bool state) public returns (bool) {
        require(msg.sender == pauseGuardian || msg.sender == owner(), "only pause guardian and owner can pause");
        require(msg.sender == owner() || state == true, "only owner can unpause");

        transferGuardianPaused = state;
        emit ActionPaused("Transfer", state);
        return state;
    }

    function _setSeizePaused(bool state) public returns (bool) {
        require(msg.sender == pauseGuardian || msg.sender == owner(), "only pause guardian and owner can pause");
        require(msg.sender == owner() || state == true, "only owner can unpause");

        seizeGuardianPaused = state;
        emit ActionPaused("Seize", state);
        return state;
    }

    function _setDistributeLemdPaused(bool state) public returns (bool) {
        require(msg.sender == pauseGuardian || msg.sender == owner(), "only pause guardian and owner can pause");
        require(msg.sender == owner() || state == true, "only owner can unpause");

        distributeLemdPaused = state;
        emit ActionPaused("DistributeLemd", state);
        return state;
    }

    /**
     * @notice Sets a new price lemdDistribution for the comptroller
     * @dev Admin function to set a new lemd distribution
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _setLemdDistribution(ILemdDistribution newLemdDistribution) public onlyOwner returns (uint) {

        ILemdDistribution oldLemdDistribution = lemdDistribution;

        lemdDistribution = newLemdDistribution;

        emit NewLemdDistribution(oldLemdDistribution, newLemdDistribution);

        return uint(Error.NO_ERROR);
    }

    function getAllMarkets() public view returns (LToken[] memory){
        return allMarkets;
    }

    function isMarketMinted(address lToken) public view returns (bool){
        return markets[lToken].isMinted;
    }

    function isMarketListed(address lToken) public view returns (bool){
        return markets[lToken].isListed;
    }

    function _setMarketMinted(address lToken, bool status) public {

        require(msg.sender == address(lemdDistribution) || msg.sender == owner(), "only LemdDistribution or owner can update");

        markets[lToken].isMinted = status;
    }

    function _setMarketMintCaps(LToken[] calldata lTokens, uint[] calldata newMintCaps) external onlyOwner {

        uint numMarkets = lTokens.length;
        uint numMintCaps = newMintCaps.length;

        require(numMarkets != 0 && numMarkets == numMintCaps, "invalid input");

        for (uint i = 0; i < numMarkets; i++) {
            mintCaps[address(lTokens[i])] = newMintCaps[i];
            emit NewBorrowCap(lTokens[i], newMintCaps[i]);
        }
    }


}
