// COPIED FROM https://github.com/compound-finance/compound-protocol/blob/master/contracts/ComptrollerInterface.sol
//Copyright 2020 Compound Labs, Inc.
//Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
//1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
//2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
//3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IComptroller {

    /*** Assets You Are In ***/

    /**
     * LEMD-MODIFY:
     * @notice Add assets to be included in account liquidity calculation
     * @param lTokens The list of addresses of the cToken markets to be enabled
     * @return Success indicator for whether each corresponding market was entered
     */
    function enterMarkets(address[] calldata lTokens) external returns (uint[] memory);

    /**
     * LEMD-MODIFY:
     * @notice Removes asset from sender's account liquidity calculation
     * @dev Sender must not have an outstanding borrow balance in the asset,
     *  or be providing necessary collateral for an outstanding borrow.
     * @param lTokenAddress The address of the asset to be removed
     * @return Whether or not the account successfully exited the market
     */
    function exitMarket(address lTokenAddress) external returns (uint);

    /*** Policy Hooks ***/

    /**
     * LEMD-MODIFY:
     * @notice Checks if the account should be allowed to mint tokens in the given market
     * @param lToken The market to verify the mint against
     * @param minter The account which would get the minted tokens
     * @param mintAmount The amount of underlying being supplied to the market in exchange for tokens
     * @return 0 if the mint is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function mintAllowed(
        address lToken,
        address minter,
        uint mintAmount
    ) external returns (uint);

    /**
     * LEMD-MODIFY:
     * @notice Validates mint and reverts on rejection. May emit logs.
     * @param lToken Asset being minted
     * @param minter The address minting the tokens
     * @param mintAmount The amount of the underlying asset being minted
     * @param mintTokens The number of tokens being minted
     */
    function mintVerify(
        address lToken,
        address minter,
        uint mintAmount,
        uint mintTokens
    ) external;

    /**
     * LEMD-MODIFY:
     * @notice Checks if the account should be allowed to redeem tokens in the given market
     * @param lToken The market to verify the redeem against
     * @param redeemer The account which would redeem the tokens
     * @param redeemTokens The number of cTokens to exchange for the underlying asset in the market
     * @return 0 if the redeem is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function redeemAllowed(
        address lToken,
        address redeemer,
        uint redeemTokens
    ) external returns (uint);

    /**
     * LEMD-MODIFY:
     * @notice Validates redeem and reverts on rejection. May emit logs.
     * @param lToken Asset being redeemed
     * @param redeemer The address redeeming the tokens
     * @param redeemAmount The amount of the underlying asset being redeemed
     * @param redeemTokens The number of tokens being redeemed
     */
    function redeemVerify(
        address lToken,
        address redeemer,
        uint redeemAmount,
        uint redeemTokens
    ) external;

    /**
     * LEMD-MODIFY:
     * @notice Checks if the account should be allowed to borrow the underlying asset of the given market
     * @param lToken The market to verify the borrow against
     * @param borrower The account which would borrow the asset
     * @param borrowAmount The amount of underlying the account would borrow
     * @return 0 if the borrow is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function borrowAllowed(
        address lToken,
        address borrower,
        uint borrowAmount
    ) external returns (uint);

    /**
     * LEMD-MODIFY:
     * @notice Validates borrow and reverts on rejection. May emit logs.
     * @param lToken Asset whose underlying is being borrowed
     * @param borrower The address borrowing the underlying
     * @param borrowAmount The amount of the underlying asset requested to borrow
     */
    function borrowVerify(
        address lToken,
        address borrower,
        uint borrowAmount
    ) external;

    /**
     * LEMD-MODIFY:
     * @notice Checks if the account should be allowed to repay a borrow in the given market
     * @param lToken The market to verify the repay against
     * @param payer The account which would repay the asset
     * @param borrower The account which would borrowed the asset
     * @param repayAmount The amount of the underlying asset the account would repay
     * @return 0 if the repay is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function repayBorrowAllowed(
        address lToken,
        address payer,
        address borrower,
        uint repayAmount
    ) external returns (uint);

    /**
     * LEMD-MODIFY:
     * @notice Validates repayBorrow and reverts on rejection. May emit logs.
     * @param lToken Asset being repaid
     * @param payer The address repaying the borrow
     * @param borrower The address of the borrower
     * @param repayAmount The amount of underlying being repaid
     */
    function repayBorrowVerify(
        address lToken,
        address payer,
        address borrower,
        uint repayAmount,
        uint borrowerIndex
    ) external;

    /**
     * LEMD-MODIFY:
     * @notice Checks if the liquidation should be allowed to occur
     * @param lTokenBorrowed Asset which was borrowed by the borrower
     * @param lTokenCollateral Asset which was used as collateral and will be seized
     * @param liquidator The address repaying the borrow and seizing the collateral
     * @param borrower The address of the borrower
     * @param repayAmount The amount of underlying being repaid
     */
    function liquidateBorrowAllowed(
        address lTokenBorrowed,
        address lTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount
    ) external returns (uint);

    /**
     * LEMD-MODIFY:
     * @notice Validates liquidateBorrow and reverts on rejection. May emit logs.
     * @param lTokenBorrowed Asset which was borrowed by the borrower
     * @param lTokenCollateral Asset which was used as collateral and will be seized
     * @param liquidator The address repaying the borrow and seizing the collateral
     * @param borrower The address of the borrower
     * @param repayAmount The amount of underlying being repaid
     */
    function liquidateBorrowVerify(
        address lTokenBorrowed,
        address lTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount,
        uint seizeTokens
    ) external;

    /**
     * LEMD-MODIFY:
     * @notice Checks if the seizing of assets should be allowed to occur
     * @param lTokenCollateral Asset which was used as collateral and will be seized
     * @param lTokenBorrowed Asset which was borrowed by the borrower
     * @param liquidator The address repaying the borrow and seizing the collateral
     * @param borrower The address of the borrower
     * @param seizeTokens The number of collateral tokens to seize
     */
    function seizeAllowed(
        address lTokenCollateral,
        address lTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens
    ) external returns (uint);

    /**
     * LEMD-MODIFY:
     * @notice Validates seize and reverts on rejection. May emit logs.
     * @param lTokenCollateral Asset which was used as collateral and will be seized
     * @param lTokenBorrowed Asset which was borrowed by the borrower
     * @param liquidator The address repaying the borrow and seizing the collateral
     * @param borrower The address of the borrower
     * @param seizeTokens The number of collateral tokens to seize
     */
    function seizeVerify(
        address lTokenCollateral,
        address lTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens
    ) external;

    /**
     * LEMD-MODIFY:
     * @notice Checks if the account should be allowed to transfer tokens in the given market
     * @param lToken The market to verify the transfer against
     * @param src The account which sources the tokens
     * @param dst The account which receives the tokens
     * @param transferTokens The number of lTokens to transfer
     * @return 0 if the transfer is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
     */
    function transferAllowed(
        address lToken,
        address src,
        address dst,
        uint transferTokens
    ) external returns (uint);

    /**
     * LEMD-MODIFY:
     * @notice Validates transfer and reverts on rejection. May emit logs.
     * @param lToken Asset being transferred
     * @param src The account which sources the tokens
     * @param dst The account which receives the tokens
     * @param transferTokens The number of lTokens to transfer
     */
    function transferVerify(
        address lToken,
        address src,
        address dst,
        uint transferTokens
    ) external;

    /*** Liquidity/Liquidation Calculations ***/

    /**
     * LEMD-MODIFY:
    * @notice Calculate number of tokens of collateral asset to seize given an underlying amount
    * @dev Used in liquidation (called in cToken.liquidateBorrowFresh)
    * @param lTokenBorrowed The address of the borrowed cToken
    * @param lTokenCollateral The address of the collateral cToken
    * @param repayAmount The amount of cTokenBorrowed underlying to convert into cTokenCollateral tokens
    * @return (errorCode, number of cTokenCollateral tokens to be seized in a liquidation)
    */
    function liquidateCalculateSeizeTokens(
        address lTokenBorrowed,
        address lTokenCollateral,
        uint repayAmount
    ) external view returns (uint, uint);
}