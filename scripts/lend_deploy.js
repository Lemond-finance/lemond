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
const config = require("../contract.config.js")

const delay = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms))

async function main() {
    await hre.run("compile")

    this.deployer = (await ethers.getSigners())[0].address
    console.log("deployer address", this.deployer)

    // Mock ERC20s
    const { OKB, USDT, ETHK, BTCK } = config.lend.tokens
    // const OKB = await MockErc20.new("OKB", "OKB", hre.ethers.utils.parseEther("100000000"), 8)
    // const USDT = await MockErc20.new("USDT", "USDT", hre.ethers.utils.parseEther("100000000"), 18)
    // const ETHK = await MockErc20.new("ETHK", "ETHK", hre.ethers.utils.parseEther("100000000"), 6)
    // const BTCK = await MockErc20.new("BTCK", "BTCK", hre.ethers.utils.parseEther("100000000"), 6)
    console.log("ERC20s", OKB.address, USDT.address, ETHK.address, BTCK.address)

    // LEMD Token
    // this.lemdToken = await LEMD.new()
    this.lemdToken = await hre.ethers.getContractAt("LEMD", "0xE667d8bD182D165D2E71cF72315bD117f6940094")
    console.log("lemdToken", this.lemdToken.address)

    // LemdBreeder
    this.lemdBreeder = await LemdBreeder.new(this.lemdToken.address, this.deployer, "1000000000000000000", "0", "100", "5760", "999", "39")
    console.log("lemdBreeder", this.lemdBreeder.address)

    // Grant miner role to lemdBreeder
    await this.lemdToken.addMinter(this.lemdBreeder.address)
    console.log("lemdToken addMinter")

    await delay(5000)
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

    await delay(5000)
    // lTokens
    this.lEther = await LEther.new()
    await this.lEther.initialize(this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "Lemond OKT", "lOKT", "18")
    this.lOKB = await LERC20.new()
    await this.lOKB.initialize(OKB.address, this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "Lemond OKB", "lOKB", "18")
    this.lUSDT = await LERC20.new()
    await this.lUSDT.initialize(USDT.address, this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "Lemond USDT", "lUSDT", "18")
    this.lETHK = await LERC20.new()
    await this.lETHK.initialize(ETHK.address, this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "Lemond ETHK", "lETHK", "18")
    this.lBTCK = await LERC20.new()
    await this.lBTCK.initialize(BTCK.address, this.comptroller.address, this.jumpRateModel.address, hre.ethers.utils.parseEther("200000000"), "Lemond BTCK", "lBTCK", "18")
    console.log("lTokens", this.lEther.address, this.lOKB.address, this.lUSDT.address, this.lETHK.address, this.lBTCK.address)

    // set Price
    const eth_address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    await this.priceOracle.setPrice(eth_address, hre.ethers.utils.parseEther("555"))
    await this.priceOracle.setPrice(OKB.address, hre.ethers.utils.parseEther("277198"))
    await this.priceOracle.setPrice(USDT.address, hre.ethers.utils.parseEther("1"))
    await this.priceOracle.setPrice(ETHK.address, hre.ethers.utils.parseEther("35532"))
    await this.priceOracle.setPrice(BTCK.address, hre.ethers.utils.parseEther("46"))
    await this.comptroller._setPriceOracle(this.priceOracle.address)
    console.log("set Price")

    await delay(5000)
    // lToken setReserveFactor
    await this.lEther._setReserveFactor(hre.ethers.utils.parseEther("0.1"))
    await this.lOKB._setReserveFactor(hre.ethers.utils.parseEther("0.05"))
    await this.lUSDT._setReserveFactor(hre.ethers.utils.parseEther("0.2"))
    await this.lETHK._setReserveFactor(hre.ethers.utils.parseEther("0.1"))
    await this.lBTCK._setReserveFactor(hre.ethers.utils.parseEther("0.1"))
    console.log("setReserveFactor")

    // LemdDistribution
    this.lemdDistribution = await LemdDistribution.new()
    await this.lemdDistribution.initialize(this.lemdToken.address, this.lemdBreeder.address, this.comptroller.address)
    console.log("lemdDistribution", this.lemdDistribution.address)

    // comptroller Config
    await this.comptroller._setMaxAssets("20")
    await this.comptroller._supportMarket(this.lEther.address)
    await this.comptroller._supportMarket(this.lOKB.address)
    await this.comptroller._supportMarket(this.lUSDT.address)
    await this.comptroller._supportMarket(this.lETHK.address)
    await this.comptroller._supportMarket(this.lBTCK.address)
    await this.comptroller._setCollateralFactor(this.lEther.address, hre.ethers.utils.parseEther("0.75"))
    await this.comptroller._setCollateralFactor(this.lOKB.address, hre.ethers.utils.parseEther("0.75"))
    await this.comptroller._setCollateralFactor(this.lUSDT.address, hre.ethers.utils.parseEther("0.75"))
    await this.comptroller._setCollateralFactor(this.lETHK.address, hre.ethers.utils.parseEther("0.75"))
    await this.comptroller._setCollateralFactor(this.lBTCK.address, hre.ethers.utils.parseEther("0.6"))
    await this.comptroller._setCloseFactor(hre.ethers.utils.parseEther("0.5"))
    await this.comptroller._setLiquidationIncentive(hre.ethers.utils.parseEther("1.05"))
    await this.comptroller._setLemdDistribution(this.lemdDistribution.address)
    await this.comptroller._setDistributeLemdPaused(false)
    await this.comptroller.enterMarkets([this.lEther.address, this.lOKB.address, this.lUSDT.address, this.lETHK.address, this.lBTCK.address])
    console.log("comptroller Config")

    await delay(5000)
    // set lTokens speed and set lemdDistribution config
    await this.lemdDistribution._setLemdSpeed(this.lEther.address, hre.ethers.utils.parseEther("1"))
    await this.lemdDistribution._setLemdSpeed(this.lOKB.address, hre.ethers.utils.parseEther("1"))
    await this.lemdDistribution._setLemdSpeed(this.lUSDT.address, hre.ethers.utils.parseEther("1"))
    await this.lemdDistribution._setLemdSpeed(this.lETHK.address, hre.ethers.utils.parseEther("1"))
    await this.lemdDistribution._setLemdSpeed(this.lBTCK.address, hre.ethers.utils.parseEther("1"))
    // await this.comptroller._setDistributeLemdPaused(false)
    await this.lemdDistribution._setEnableAll(true)

    /** Stake Pool Test **/
    // Add Stake Pool
    await this.lEther.mint({ value: hre.ethers.utils.parseEther("10") })
    await this.lemdToken.addMinter(this.deployer)
    await this.lemdToken.addMinter(this.lemdBreeder.address)
    await this.lemdToken.mint(this.lemdBreeder.address, hre.ethers.utils.parseEther("1000"))
    const ZERO_ADDR = "0x0000000000000000000000000000000000000000"
    await this.lemdBreeder.add("1000", this.lEther.address, ZERO_ADDR, true)
    const lEtherBalance = (await this.lEther.balanceOf(this.deployer)).toString()
    console.log("lEtherBalance", lEtherBalance)
    await this.lEther.approve(this.lemdBreeder.address, hre.ethers.utils.parseEther("100"))
    console.log((await this.lEther.allowance(this.deployer, this.lemdBreeder.address)).toString())
    console.log(JSON.parse(JSON.stringify(await this.lemdBreeder.poolInfo(0))))
    console.log("lEther address", this.lEther.address)
    await this.lemdBreeder.stake(0, "10000")

    console.log("End")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
