pragma solidity 0.6.12;

import "./LEther.sol";

/**
 * @title Compound's Maximillion Contract
 * @author Compound
 */
contract Maximillion {
    /**
     * @notice The default cEther market to repay in
     */
    LEther public lEther;

    /**
     * @notice Construct a Maximillion to repay max in a CEther market
     */
    constructor(LEther lEther_) public {
        lEther = lEther_;
    }

    /**
     * @notice msg.sender sends Ether to repay an account's borrow in the cEther market
     * @dev The provided Ether is applied towards the borrow balance, any excess is refunded
     * @param borrower The address of the borrower account to repay on behalf of
     */
    function repayBehalf(address borrower) public payable {
        repayBehalfExplicit(borrower, lEther);
    }

    /**
     * @notice msg.sender sends Ether to repay an account's borrow in a cEther market
     * @dev The provided Ether is applied towards the borrow balance, any excess is refunded
     * @param borrower The address of the borrower account to repay on behalf of
     * @param lEther_ The address of the cEther contract to repay in
     */
    function repayBehalfExplicit(address borrower, LEther lEther_) public payable {
        uint received = msg.value;
        uint borrows = lEther_.borrowBalanceCurrent(borrower);
        if (received > borrows) {
            lEther_.repayBorrowBehalf.value(borrows)(borrower);
            msg.sender.transfer(received - borrows);
        } else {
            lEther_.repayBorrowBehalf.value(received)(borrower);
        }
    }
}
