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

const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))

async function main() {
    await hre.run('compile')

    this.deployer = (await ethers.getSigners())[0].address
    console.log('deployer address',this.deployer)

    const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

    // Mock ERC20s
    this.WBTC = await MockErc20.new('WBTC', 'WBTC', hre.ethers.utils.parseEther('100000000'),8)
    // await hre.run("verify:verify", { address: this.WBTC.address, constructorArguments: ['WBTC', 'WBTC', hre.ethers.utils.parseEther('100000000'),8] })
    // npx hardhat verify --network bsc 0x95BAC1812D5ffccB72Ba64195EE6868769965D59 "WBTC" "WBTC" "100000000000000000000000000" 8
    this.DAI = await MockErc20.new('DAI', 'DAI', hre.ethers.utils.parseEther('100000000'),18)
    this.USDT = await MockErc20.new('USDT', 'USDT', hre.ethers.utils.parseEther('100000000'),6)
    this.USDC = await MockErc20.new('USDC', 'USDC', hre.ethers.utils.parseEther('100000000'),6)
    console.log("ERC20s",this.WBTC.address, this.DAI.address, this.USDT.address, this.USDC.address)

    // WPC Token
    this.piggyToken = await PiggyToken.new()
    console.log("piggyToken",this.piggyToken.address)

    // PiggyBreeder
    this.piggyBreeder = await PiggyBreeder.new(this.piggyToken.address, this.deployer, '1000000000000000000', '0', '100', '5760', '999', '39')
    console.log("piggyBreeder",this.piggyBreeder.address)

    // Grant miner role to piggyBreeder
    await this.piggyToken.grantRole(
        "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", 
        this.piggyBreeder.address
    )
    console.log("piggyToken grantRole",this.piggyBreeder.address)

    // Price oracle
    this.priceOracle = await SimplePriceOracle.new()
    await this.priceOracle.initialize()
    console.log("priceOracle",this.priceOracle.address)


    // Comptroller
    this.comptroller = await Comptroller.new()
    await this.comptroller.initialize()
    console.log("comptroller",this.comptroller.address)

    // JumpRateModel
    this.jumpRateModel = await JumpRateModel.new()
    await this.jumpRateModel.initialize(
        hre.ethers.utils.parseEther('0.05'),
        hre.ethers.utils.parseEther('0.45'),
        hre.ethers.utils.parseEther('0.25'),
        hre.ethers.utils.parseEther('0.95')
    )
    console.log("jumpRateModel",this.jumpRateModel.address)

    // pTokens
    this.pEther = await PEther.new()
    await this.pEther.initialize(
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pETH',
        'pETH',
        '18'
    )
    this.pDAI = await PERC20.new()
    await this.pDAI.initialize(
        this.DAI.address,
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pDAI',
        'pDAI',
        '8'
    )
    this.pUSDT = await PERC20.new()
    await this.pUSDT.initialize(
        this.USDT.address,
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pUSDT',
        'pUSDT',
        '8'
    )
    this.pUSDC = await PERC20.new()
    await this.pUSDC.initialize(
        this.USDC.address,
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pUSDC',
        'pUSDC',
        '8'
    )
    this.pwBTC = await PERC20.new()
    await this.pwBTC.initialize(
        this.WBTC.address,
        this.comptroller.address, 
        this.jumpRateModel.address, 
        hre.ethers.utils.parseEther('200000000'),
        'pwBTC',
        'pwBTC',
        '8'
    )
    console.log("pTokens",this.pEther.address, this.pDAI.address, this.pUSDC.address, this.pUSDT.address, this.pwBTC.address)

    // set Price
    const eth_address = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    await this.priceOracle.setPrice(eth_address, hre.ethers.utils.parseEther('2000'))
    await this.priceOracle.setPrice(this.DAI.address, hre.ethers.utils.parseEther('1'))
    await this.priceOracle.setPrice(this.USDT.address, hre.ethers.utils.parseEther('1'))
    await this.priceOracle.setPrice(this.USDC.address, hre.ethers.utils.parseEther('1'))
    await this.priceOracle.setPrice(this.WBTC.address, hre.ethers.utils.parseEther('60000'))
    await this.comptroller._setPriceOracle(this.priceOracle.address)
    console.log("set Price")

    // pToken setReserveFactor
    await this.pEther._setReserveFactor(hre.ethers.utils.parseEther('0.1'))
    await this.pDAI._setReserveFactor(hre.ethers.utils.parseEther('0.05'))
    await this.pUSDC._setReserveFactor(hre.ethers.utils.parseEther('0.2'))
    await this.pUSDT._setReserveFactor(hre.ethers.utils.parseEther('0.1'))
    await this.pwBTC._setReserveFactor(hre.ethers.utils.parseEther('0.1'))
    console.log("setReserveFactor")

    // PiggyDistribution
    this.piggyDistribution = await PiggyDistribution.new()
    await this.piggyDistribution.initialize(this.piggyToken.address, this.piggyBreeder.address, this.comptroller.address)

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
    await this.comptroller._setLiquidationIncentive(hre.ethers.utils.parseEther('1.05'))
    await this.comptroller._setPiggyDistribution(this.piggyDistribution.address)
    await this.comptroller._setDistributeWpcPaused(true)
    await this.comptroller.enterMarkets([
        this.pEther.address,
        this.pDAI.address,
        this.pUSDT.address,
        this.pUSDC.address,
        this.pwBTC.address
    ])
    console.log("comptroller Config")

    // set pTokens speed
    await this.piggyDistribution._setWpcSpeed(this.pEther.address,hre.ethers.utils.parseEther('1'))

    /* Lend Test */
    await this.comptroller._setDistributeWpcPaused(false)
    await this.piggyDistribution._setEnableAll(true)
    await this.piggyToken.grantRole(
        "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", 
        this.deployer
    )
    await this.piggyToken.mint(this.piggyDistribution.address, hre.ethers.utils.parseEther('1000'))
    await this.pEther.mint({
        value: hre.ethers.utils.parseEther('1')
    })
    console.log("pEther deplayer",(await this.pEther.balanceOf(this.deployer)).toString())
    await delay(5000)
    await this.pEther.mint({
        value: hre.ethers.utils.parseEther('1')
    })
    await this.pEther.mint({
        value: hre.ethers.utils.parseEther('1')
    })
    await delay(5000)
    console.log("PiggyBreeder piggyToken",(await this.piggyToken.balanceOf(this.piggyDistribution.address)).toString())
    console.log("deplyer piggyToken",(await this.piggyToken.balanceOf(this.deployer)).toString())

    await this.DAI.approve(this.pDAI.address, hre.ethers.utils.parseEther('50000'))

    console.log("pendingWpcAccrued",(await this.piggyDistribution.pendingWpcAccrued(this.deployer,true,true)).toString())

    await this.pDAI.mint(hre.ethers.utils.parseEther('50000'))
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[1].toString())

    await this.pDAI.borrow(hre.ethers.utils.parseEther("1000"));
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[1].toString())


    /** Stake Pool Test **/
    // Add Stake Pool
    await this.piggyBreeder.add('1000', this.pEther.address, ZERO_ADDR, false)
    // console.log(JSON.parse(JSON.stringify(await this.piggyBreeder.poolInfo(0))))
    await this.piggyBreeder.add('1000', this.pDAI.address, ZERO_ADDR, false)
    await this.piggyBreeder.add('1000', this.pUSDT.address, ZERO_ADDR, false)
    await this.piggyBreeder.add('1000', this.pUSDC.address, ZERO_ADDR, false)
    await this.piggyBreeder.add('1000', this.pwBTC.address, ZERO_ADDR, false)
    // console.log("PiggyBreeder piggyToken",(await this.piggyToken.balanceOf(this.piggyBreeder.address)).toString())
    // console.log("deplyer piggyToken",(await this.piggyToken.balanceOf(this.deployer)).toString())
    // console.log("Add Pool")

    // await this.piggyToken.grantRole(
    //     "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", 
    //     this.deployer
    // )
    // await this.piggyToken.mint(this.deployer,hre.ethers.utils.parseEther("1000"))
    // await this.piggyDistribution._stakeTokenToPiggyBreeder(this.piggyToken.address, '0')
    // await this.piggyDistribution._setWpcRate(hre.ethers.utils.parseEther('0.5'))
    // await this.piggyDistribution._addWpcMarkets([
    //     this.pEther.address,
    //     this.pDAI.address,
    //     this.pUSDT.address,
    //     this.pUSDC.address,
    //     this.pwBTC.address
    // ])
    
    // await delay(5000)
    // await this.DAI.approve(this.pDAI.address, hre.ethers.utils.parseEther("1000"))
    // await this.pDAI.repayBorrow(hre.ethers.utils.parseEther("1000"))
    // await this.piggyDistribution.claimWpc(this.deployer)
    // console.log("pendingPiggy",(await this.piggyBreeder.allPendingPiggy(this.piggyDistribution.address)).toString())
    // console.log("pendingPiggy",(await this.piggyBreeder.allPendingPiggy(this.deployer)).toString())
    // console.log("wpcAccrued",(await this.piggyDistribution.wpcAccrued(this.deployer)).toString())

    console.log("End")
    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
