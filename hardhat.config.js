require('@nomiclabs/hardhat-waffle')
require('hardhat-abi-exporter')
require('@openzeppelin/hardhat-upgrades')
require('@nomiclabs/hardhat-truffle5')
require("@nomiclabs/hardhat-etherscan")
require("hardhat-log-remover")

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        hardhat: {
            allowUnlimitedContractSize: true,
        },
        okexchain: {
            url: "https://exchaintestrpc.okex.org",
            accounts: [mnemonic],
            timeout: 30000,
        },
        rinkeby: {
            url: "https://rinkeby.infura.io/v3/3970ae72d3db40f6a6dfad8544b4da1c",
            accounts: [mnemonic],
            timeout: 20000,
        },
        ropsten: {
            url: "https://ropsten.infura.io/v3/3970ae72d3db40f6a6dfad8544b4da1c",
            accounts: [mnemonic],
            timeout: 20000,
        },
        bsc: {
            url: "https://data-seed-prebsc-2-s1.binance.org:8545",
            accounts: [mnemonic],
            timeout: 200000,
        },
        eth: {
            url: "https://mainnet.infura.io/v3/3970ae72d3db40f6a6dfad8544b4da1c",
            accounts: [mnemonic],
        },
        bscmain: {
            url: "https://bsc-dataseed.binance.org",
            accounts: [mnemonic],
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.6.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.5.8",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    mocha: {
        timeout: 20000,
    },
    abiExporter: {
        path: "./abi",
        clear: true,
        flat: true,
        // only: ['ERC20'],
    },
    etherscan: {
        apiKey: "XARD1DFR8AU129FVP25A33FRD6AE1EQSU3",
    },
}
