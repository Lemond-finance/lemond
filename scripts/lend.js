// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// npx hardhat verify --network bsc 0x95BAC1812D5ffccB72Ba64195EE6868769965D59 "WBTC" "WBTC" "100000000000000000000000000" 8
const hre = require("hardhat")
const { ethers, upgrades } = require("hardhat")
const BigNumber = require("bignumber.js")
const web3 = require("web3")

const LEMD = artifacts.require("LEMD")
const MockErc20 = artifacts.require("MockERC20")
const Comptroller = artifacts.require("Comptroller")
const JumpRateModel = artifacts.require("JumpRateModel")
const LEther = artifacts.require("LEther")
const LERC20 = artifacts.require("LERC20")
const SimplePriceOracle = artifacts.require("SimplePriceOracle")
const LemdDistribution = artifacts.require("LemdDistribution")
const LemdToken = artifacts.require("LemdToken")
const LemdBreeder = artifacts.require("LemdBreeder")

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms))

async function main() {
    await hre.run("compile")

    this.deployer = (await ethers.getSigners())[0].address
    console.log("deployer address", this.deployer)

    // Mock ERC20s
    this.WBTC = await MockErc20.new("WBTC", "WBTC", hre.ethers.utils.parseEther("100000000"), 8)
    this.DAI = await MockErc20.new("DAI", "DAI", hre.ethers.utils.parseEther("100000000"), 18)
    this.USDT = await MockErc20.new("USDT", "USDT", hre.ethers.utils.parseEther("100000000"), 6)
    this.USDC = await MockErc20.new("USDC", "USDC", hre.ethers.utils.parseEther("100000000"), 6)
    console.log("ERC20s", this.WBTC.address, this.DAI.address, this.USDT.address, this.USDC.address)

    // LEMD Token
    this.lemdToken = await LEMD.new()
    console.log("lemdToken", this.lemdToken.address)

    // LemdBreeder
    this.lemdBreeder = await LemdBreeder.new(this.lemdToken.address, this.deployer, "1000000000000000000", "0", "0", "5760", "999", "39")
    console.log("lemdBreeder", this.lemdBreeder.address)

    // Grant miner role to lemdBreeder
    // await this.lemdToken.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", this.lemdBreeder.address)
    await this.lemdToken.addMinter(this.lemdBreeder.address)
    console.log("lemdToken grantRole", this.lemdBreeder.address)

    // Price oracle
    this.priceOracle = await SimplePriceOracle.new()
    await this.priceOracle.initialize()
    console.log("priceOracle", this.priceOracle.address)

    // Comptroller
    this.comptroller = await Comptroller.new()
    await this.comptroller.initialize()
    console.log("comptroller", this.comptroller.address)

    // JumpRateModel
    this.jumpRateModel = await JumpRateModel.new()
    await this.jumpRateModel.initialize(hre.ethers.utils.parseEther("0.05"), hre.ethers.utils.parseEther("0.45"), hre.ethers.utils.parseEther("0.25"), hre.ethers.utils.parseEther("0.95"))
    console.log("jumpRateModel", this.jumpRateModel.address)

    // lTokens
    this.lEther = await LEther.new()
    await this.lEther.initialize(this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "lOKT", "lOKT", "18")
    this.lDAI = await LERC20.new()
    await this.lDAI.initialize(this.DAI.address, this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "lDAI", "lDAI", "8")
    this.lUSDT = await LERC20.new()
    await this.lUSDT.initialize(this.USDT.address, this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "lUSDT", "lUSDT", "8")
    this.lUSDC = await LERC20.new()
    await this.lUSDC.initialize(this.USDC.address, this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "lUSDC", "lUSDC", "8")
    this.lwBTC = await LERC20.new()
    await this.lwBTC.initialize(this.WBTC.address, this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "lwBTC", "lwBTC", "8")
    console.log("lTokens", this.lEther.address, this.lDAI.address, this.lUSDC.address, this.lUSDT.address, this.lwBTC.address)

    // set Price
    const eth_address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    await this.priceOracle.setPrice(eth_address, hre.ethers.utils.parseEther("2000"))
    await this.priceOracle.setPrice(this.DAI.address, hre.ethers.utils.parseEther("1"))
    await this.priceOracle.setPrice(this.USDT.address, hre.ethers.utils.parseEther("1"))
    await this.priceOracle.setPrice(this.USDC.address, hre.ethers.utils.parseEther("1"))
    await this.priceOracle.setPrice(this.WBTC.address, hre.ethers.utils.parseEther("60000"))
    await this.comptroller._setPriceOracle(this.priceOracle.address)
    console.log("set Price")

    // lToken setReserveFactor
    await this.lEther._setReserveFactor(hre.ethers.utils.parseEther("0.1"))
    await this.lDAI._setReserveFactor(hre.ethers.utils.parseEther("0.05"))
    await this.lUSDC._setReserveFactor(hre.ethers.utils.parseEther("0.2"))
    await this.lUSDT._setReserveFactor(hre.ethers.utils.parseEther("0.1"))
    await this.lwBTC._setReserveFactor(hre.ethers.utils.parseEther("0.1"))
    console.log("setReserveFactor")

    // LemdDistribution
    this.lemdDistribution = await LemdDistribution.new()
    await this.lemdDistribution.initialize(this.lemdToken.address, this.lemdBreeder.address, this.comptroller.address)
    console.log("lemdDistribution", this.lemdDistribution.address)

    // comptroller Config
    await this.comptroller._setMaxAssets("20")
    await this.comptroller._supportMarket(this.lEther.address)
    await this.comptroller._supportMarket(this.lDAI.address)
    await this.comptroller._supportMarket(this.lUSDC.address)
    await this.comptroller._supportMarket(this.lUSDT.address)
    await this.comptroller._supportMarket(this.lwBTC.address)
    await this.comptroller._setCollateralFactor(this.lEther.address, hre.ethers.utils.parseEther("0.75"))
    await this.comptroller._setCollateralFactor(this.lDAI.address, hre.ethers.utils.parseEther("0.75"))
    await this.comptroller._setCollateralFactor(this.lUSDC.address, hre.ethers.utils.parseEther("0.75"))
    await this.comptroller._setCollateralFactor(this.lUSDT.address, hre.ethers.utils.parseEther("0.75"))
    await this.comptroller._setCollateralFactor(this.lwBTC.address, hre.ethers.utils.parseEther("0.6"))
    await this.comptroller._setCloseFactor(hre.ethers.utils.parseEther("0.5"))
    await this.comptroller._setLiquidationIncentive(hre.ethers.utils.parseEther("1.05"))
    await this.comptroller._setLemdDistribution(this.lemdDistribution.address)
    await this.comptroller._setDistributeLemdPaused(true)
    await this.comptroller.enterMarkets([this.lEther.address, this.lDAI.address, this.lUSDT.address, this.lUSDC.address, this.lwBTC.address])
    console.log("comptroller Config")

    // set lTokens speed and set lemdDistribution config
    await this.lemdDistribution._setLemdSpeed(this.lEther.address, hre.ethers.utils.parseEther("1"))
    await this.comptroller._setDistributeLemdPaused(false)
    await this.lemdDistribution._setEnableAll(true)

    /* Lend Test */
    // await this.lemdToken.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", this.deployer)
    await this.lemdToken.addMinter(this.deployer)
    await this.lemdToken.mint(this.lemdDistribution.address, hre.ethers.utils.parseEther("1000"))
    // await this.lEther.mint({ value: hre.ethers.utils.parseEther("1") })
    console.log("lEther deplayer", (await this.lEther.balanceOf(this.deployer)).toString())
    await this.lEther.mint({ value: hre.ethers.utils.parseEther("1") })
    console.log("LemdBreeder lemdToken", (await this.lemdToken.balanceOf(this.lemdDistribution.address)).toString())
    console.log("deplyer lemdToken", (await this.lemdToken.balanceOf(this.deployer)).toString())

    await this.DAI.approve(this.lDAI.address, hre.ethers.utils.parseEther("2000"))

    console.log("pendingLemdAccrued", (await this.lemdDistribution.pendingLemdAccrued(this.deployer, true, true)).toString())

    await this.lDAI.mint(hre.ethers.utils.parseEther("2000"))
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[0].toString())
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[1].toString())
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[2].toString())

    await this.lDAI.borrow(hre.ethers.utils.parseEther("2000"))
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[0].toString())
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[1].toString())
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[2].toString())

    await this.lEther.borrow(hre.ethers.utils.parseEther("0.5"))
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[0].toString())
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[1].toString())
    console.log((await this.comptroller.getAccountLiquidity(this.deployer))[2].toString())

    console.log(hre.ethers.utils.formatEther((await this.lemdToken.balanceOf(this.deployer)).toString()))
    await this.lemdDistribution.claimLemd(this.deployer)
    console.log(hre.ethers.utils.formatEther((await this.lemdToken.balanceOf(this.deployer)).toString()))

    /** Stake Pool Test **/
    // Add Stake Pool
    await this.lemdToken.mint(this.lemdBreeder.address, hre.ethers.utils.parseEther("1000"))
    const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
    await this.lemdBreeder.add("1000", this.lEther.address, ZERO_ADDR, true)
    // await this.lemdBreeder.add("1000", this.lDAI.address, ZERO_ADDR, true)
    // await this.lemdBreeder.add("1000", this.lUSDT.address, ZERO_ADDR, true)
    // await this.lemdBreeder.add("1000", this.lUSDC.address, ZERO_ADDR, true)
    // await this.lemdBreeder.add("1000", this.lwBTC.address, ZERO_ADDR, true)

    const lEtherBalance = (await this.lEther.balanceOf(this.deployer)).toString()
    console.log("lEtherBalance", lEtherBalance)
    await this.lEther.approve(this.lemdBreeder.address, hre.ethers.utils.parseEther("100"))
    console.log((await this.lEther.allowance(this.deployer, this.lemdBreeder.address)).toString())
    console.log(JSON.parse(JSON.stringify(await this.lemdBreeder.poolInfo(0))))
    console.log("lEther address", this.lEther.address)
    await this.lemdBreeder.stake(0,"1")
    // await this.lDAI.approve(this.lemdBreeder.address, "1000000000000000000000000000000")
    // await this.lUSDT.approve(this.lemdBreeder.address, "1000000000000000000000000000000")
    // await this.lwBTC.approve(this.lemdBreeder.address, "1000000000000000000000000000000")
    // await this.lUSDC.approve(this.lemdBreeder.address, "1000000000000000000000000000000")
    // await this.lemdBreeder.stake(0, "1")
    // await this.lemdDistribution.claimLemd(this.deployer)
    // console.log("pendingLemd", (await this.lemdBreeder.allPendingLemd(this.lemdDistribution.address)).toString())
    // console.log("pendingLemd", (await this.lemdBreeder.allPendingLemd(this.deployer)).toString())
    // console.log("lemdAccrued", (await this.lemdDistribution.lemdAccrued(this.deployer)).toString())

    console.log("End")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
