// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const BigNumber = require('bignumber.js')
const web3 = require('web3')

const MockErc20 = artifacts.require('MockERC20')
const Comptroller = artifacts.require("Comptroller")
const JumpRateModel = artifacts.require('JumpRateModel')
const PEther = artifacts.require('PEther')
const PERC20 = artifacts.require('PERC20')
const SimplePriceOracle = artifacts.require('SimplePriceOracle')

async function main() {
    await hre.run('compile')

    this.deployer = (await ethers.getSigners())[0].address
    console.log('deployer address',this.deployer)

    this.comptroller = await Comptroller.new()
    this.comptroller.initialize()
    this.DAI = await MockErc20.new('DAI', 'DAI', hre.ethers.utils.parseEther('100000'),8)
    this.BAT = await MockErc20.new('BAT', 'BAT', hre.ethers.utils.parseEther('10000000000'),18)
    this.jumpRateModel = await JumpRateModel.new()
    this.jumpRateModel.initialize(
        hre.ethers.utils.parseEther('0.05'),
        hre.ethers.utils.parseEther('0.45'),
        hre.ethers.utils.parseEther('0.25'),
        hre.ethers.utils.parseEther('0.95')
    )
    this.priceOracle = await SimplePriceOracle.new()
    this.priceOracle.initialize()
    this.pEther = await PEther.new()
    this.pEther.initialize(
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pETH',
        'pETH',
        '18'
    )
    this.pDAI = await PERC20.new()
    this.pDAI.initialize(
        this.DAI.address, 
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pDAI',
        'pDAI',
        '18'
    )
    this.pBAT = await PERC20.new()
    this.pBAT.initialize(
        this.BAT.address, 
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pBAT',
        'pBAT',
        '18'
    )

    const eth_address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    await this.priceOracle.setPrice(eth_address, hre.ethers.utils.parseEther('460'))
    await this.priceOracle.setPrice(this.DAI.address, hre.ethers.utils.parseEther('1'))
    await this.priceOracle.setPrice(this.BAT.address, hre.ethers.utils.parseEther('0.0005'))
    await this.comptroller._setPriceOracle(this.priceOracle.address)

    await this.comptroller._setDistributeWpcPaused(true)

    await this.comptroller._supportMarket(this.pEther.address)
    await this.comptroller._supportMarket(this.pDAI.address)
    await this.comptroller._supportMarket(this.pBAT.address)

    await this.comptroller._setMaxAssets('10')
    await this.comptroller._setCollateralFactor(this.pDAI.address,hre.ethers.utils.parseEther('0.6'))
    await this.comptroller._setCollateralFactor(this.pBAT.address,hre.ethers.utils.parseEther('0.6'))
    await this.comptroller._setCollateralFactor(this.pEther.address,hre.ethers.utils.parseEther('0.75'))
    await this.comptroller._setCloseFactor(hre.ethers.utils.parseEther('0.5'))
    await this.comptroller._setLiquidationIncentive(hre.ethers.utils.parseEther('1.05'))

    await this.comptroller.enterMarkets([
            this.pEther.address,
            this.pDAI.address,
            this.pBAT.address
    ])

    await this.pEther.mint({
        value: hre.ethers.utils.parseEther('10')
    })
    
    await this.DAI.approve(this.pDAI.address, hre.ethers.utils.parseEther('50000'))
    await this.pDAI.mint(hre.ethers.utils.parseEther('50000'))
    
    await this.BAT.approve(this.pBAT.address, hre.ethers.utils.parseEther('10000000000'))
    await this.pBAT.mint(hre.ethers.utils.parseEther('10000000000'))

    await this.priceOracle.setPrice(this.BAT.address, hre.ethers.utils.parseEther('0.0002'))
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[0].toString())
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[1].toString())
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[2].toString())

    console.log("End")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
