// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const BigNumber = require('bignumber.js')
const web3 = require('web3')

const FakeDai = artifacts.require("./FakeDai")
const Unitroller = artifacts.require("./Unitroller")
const Comptroller = artifacts.require("./Comptroller")
const WhitePaperInterestRateModel = artifacts.require("./WhitePaperInterestRateModel")
const CErc20 = artifacts.require("./CErc20")

async function main() {
  await hre.run('compile')

  this.deployer = (await ethers.getSigners())[0].address
  console.log('deployer address',this.deployer)

  // 1. Deploy DAI token contract
  this.fakeDai = await FakeDai.new()
  console.log('FakeDai', this.fakeDai.address)

  // 2. Deploy Unitroller contract
  this.unitroller = await Unitroller.new()
  console.log("Unitroller",this.unitroller.address)

  // 3. Deploy Comptroller contract
  this.comptroller = await Comptroller.new()
  console.log("Comptroller",this.comptroller.address)

  // 4. _setPendingImplementation function
  this.unitroller._setPendingImplementation(this.comptroller.address)
  console.log("setPendingImplementation")

  // 5. Deploy WhitePaperInterestRateModel contract
  this.whitePaperInterestRateModel = await WhitePaperInterestRateModel.new(
      hre.ethers.utils.parseEther('0.02'),
      hre.ethers.utils.parseEther('0.3')
  )
  console.log("WhitePaperInterestRateModel", this.whitePaperInterestRateModel.address)

  // 6. Deploy cErc20 contract
  this.cErc20 = await CErc20.new(
      this.fakeDai.address,
      this.comptroller.address,
      this.whitePaperInterestRateModel,
      hre.ethers.utils.parseEther('200000000'),
      "Compound Dai",
      "cDAI",
      8
  )
  console.log("CErc20",this.cErc20.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
