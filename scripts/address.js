// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const BigNumber = require('bignumber.js')
const web3 = require('web3')
const oktPool = require('../abi/OKTPool.json')

const OKTPool = artifacts.require("./OKTPool")
const LEMD = artifacts.require("./LEMD")

async function main() {
  await hre.run('compile')

  this.deployer = (await ethers.getSigners())[0].address
  console.log('deployer address',this.deployer)

   const web3 = new Web3('https://exchaintest.okexcn.com')
   const contract = new web3.eth.Contract(oktPool, '0x6eF0adF5dB077FE8A69f94D25e4EF29a0726e779')
   console.log(1)
   contract.getPastEvents('allEvents', { filter: {fromBlock: 0, toBlock: 'latest' } },
    (error, events) => {
        console.log(events);    //return empty array, not all events
    })
//    contract.getPastEvents(
//     'AllEvents',
//     {
//         fromBlock: '0',
//         toBlock: 'latest'
//     })
//     .then(function(events) {
//         console.log(events)
//     })
//     .catch((err) => console.error(err));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
