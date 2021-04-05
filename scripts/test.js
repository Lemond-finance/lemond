// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const BigNumber = require('bignumber.js')
const web3 = require('web3')

const Comptroller = artifacts.require("Comptroller")
const comptroller = require('../abi/Comptroller.json')


async function main() {
    await hre.run('compile')

    this.deployer = (await ethers.getSigners())[0].address
    console.log('deployer address',this.deployer)

    const contract = await hre.ethers.getContractAt(
        'Comptroller',
        '0xe656189F4ACcb4614552E6b75b1D280e081e868D'
    )
    // await contract.claimComp(this.deployer)


    console.log("End")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })