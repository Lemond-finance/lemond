// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface LemdPriceOracleInterface {

    function getPrice(address token) external view returns (uint);

    function setPrice(address token, uint price, bool force) external;

}