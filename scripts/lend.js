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
const PiggyDistribution = artifacts.require('PiggyDistribution')
const PiggyToken = artifacts.require('WePiggyToken')
const PiggyBreeder = artifacts.require('PiggyBreeder')

async function main() {
    await hre.run('compile')

    this.deployer = (await ethers.getSigners())[0].address
    console.log('deployer address',this.deployer)

    const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

    // Mock ERC20s
    this.WBTC = await MockErc20.new('WBTC', 'WBTC', hre.ethers.utils.parseEther('100000000'),8)
    this.DAI = await MockErc20.new('DAI', 'DAI', hre.ethers.utils.parseEther('100000000'),18)
    this.USDT = await MockErc20.new('USDT', 'USDT', hre.ethers.utils.parseEther('100000000'),6)
    this.USDC = await MockErc20.new('USDC', 'USDC', hre.ethers.utils.parseEther('100000000'),6)

    // WPC Token
    this.piggyToken = await PiggyToken.new()

    // PiggyBreeder
    this.piggyBreeder = await PiggyBreeder.new(this.piggyToken.address, this.deployer, '1000000000000000000', '0', '100', '5760', '999', '39')

    // Grant miner role to piggyBreeder
    await this.piggyToken.grantRole(this.deployer, this.piggyBreeder.address)

    // Price oracle
    this.priceOracle = await SimplePriceOracle.new()
    await this.priceOracle.initialize()

    // Comptroller
    this.comptroller = await Comptroller.new()
    await this.comptroller.initialize()

    // JumpRateModel
    this.jumpRateModel = await JumpRateModel.new()
    await this.jumpRateModel.initialize(
        hre.ethers.utils.parseEther('0.05'),
        hre.ethers.utils.parseEther('0.45'),
        hre.ethers.utils.parseEther('0.25'),
        hre.ethers.utils.parseEther('0.95')
    )

    // pTokens
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
        '8'
    )

    this.pUSDT = await PERC20.new()
    this.pUSDT.initialize(
        this.USDT.address,
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pUSDT',
        'pUSDT',
        '8'
    )

    this.pUSDC = await PERC20.new()
    this.pUSDC.initialize(
        this.USDC.address,
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pUSDC',
        'pUSDC',
        '8'
    )

    this.pwBTC = await PERC20.new()
    this.pwBTC.initialize(
        this.WBTC.address,
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pwBTC',
        'pwBTC',
        '8'
    )

    // set Price
    const eth_address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    await this.priceOracle.setPrice(eth_address, hre.ethers.utils.parseEther('1950'))
    await this.priceOracle.setPrice(this.DAI.address, hre.ethers.utils.parseEther('1'))
    await this.priceOracle.setPrice(this.USDT.address, hre.ethers.utils.parseEther('1'))
    await this.priceOracle.setPrice(this.USDC.address, hre.ethers.utils.parseEther('1'))
    await this.priceOracle.setPrice(this.WBTC.address, hre.ethers.utils.parseEther('60000'))
    await this.comptroller._setPriceOracle(this.priceOracle.address)

    // pToken setReserveFactor
    await this.pEther._setReserveFactor(hre.ethers.utils.parseEther('0.1'))
    await this.pDAI._setReserveFactor(hre.ethers.utils.parseEther('0.05'))
    await this.pUSDC._setReserveFactor(hre.ethers.utils.parseEther('0.2'))
    await this.pUSDT._setReserveFactor(hre.ethers.utils.parseEther('0.1'))
    await this.pwBTC._setReserveFactor(hre.ethers.utils.parseEther('0.1'))

    // comptroller Config
    await this.comptroller._setMaxAssets('20')
    await this.comptroller._supportMarket(this.pEther.address)
    await this.comptroller._supportMarket(this.pDAI.address)
    await this.comptroller._supportMarket(this.pUSDC.address)
    await this.comptroller._supportMarket(this.pUSDT.address)
    await this.comptroller._supportMarket(this.pwBTC.address)
    await this.comptroller._setCollateralFactor(this.pEther.address,hre.ethers.utils.parseEther('0.75'))
    await this.comptroller._setCollateralFactor(this.pDAI.address,hre.ethers.utils.parseEther('0.75'))
    await this.comptroller._setCollateralFactor(this.pUSDC.address,hre.ethers.utils.parseEther('0'))
    await this.comptroller._setCollateralFactor(this.pUSDT.address,hre.ethers.utils.parseEther('0.75'))
    await this.comptroller._setCollateralFactor(this.pwBTC.address,hre.ethers.utils.parseEther('0.6'))
    await this.comptroller._setCloseFactor(hre.ethers.utils.parseEther('0.5'))
    await this.comptroller._setDistributeWpcPaused(true)

    // PiggyDistribution
    
    this.piggyDistribution = await PiggyDistribution.new()
    await this.piggyDistribution.initialize(this.piggyToken.address, this.piggyBreeder.address, this.comptroller.address)
    await this.comptroller._setPiggyDistribution(this.piggyDistribution.address)
    await this.piggyDistribution._addWpcMarkets([this.pEther.address])

    this.Mock = await MockErc20.new('Mock', 'Mock', hre.ethers.utils.parseEther('100000000'),18)
    await this.piggyBreeder.add('1000', this.Mock.address, ZERO_ADDR, false)
    await this.Mock.transfer(this.piggyDistribution.address, hre.ethers.utils.parseEther('100'))
    await this.piggyDistribution._stakeTokenToPiggyBreeder(this.Mock.address, 0)


    // Add Pool
    await this.piggyBreeder.add('1000', this.pEther.address, ZERO_ADDR, false)
    await this.piggyBreeder.add('1000', this.pDAI.address, ZERO_ADDR, false)
    await this.piggyBreeder.add('1000', this.pUSDT.address, ZERO_ADDR, false)
    await this.piggyBreeder.add('1000', this.pUSDC.address, ZERO_ADDR, false)
    await this.piggyBreeder.add('1000', this.pwBTC.address, ZERO_ADDR, false)


    // await this.comptroller._setLiquidationIncentive(hre.ethers.utils.parseEther('1.05'))

    await this.comptroller.enterMarkets([
            this.pEther.address,
            this.pDAI.address,
            this.pUSDT.address,
            this.pUSDC.address,
            this.pwBTC.address,
    ])

    await this.pEther.mint({
        value: hre.ethers.utils.parseEther('1')
    })
    
    await this.DAI.approve(this.pDAI.address, hre.ethers.utils.parseEther('50000'))
    await this.pDAI.mint(hre.ethers.utils.parseEther('50000'))

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
