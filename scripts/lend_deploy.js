// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const BigNumber = require('bignumber.js')
const web3 = require('web3')

const LEMD = artifacts.require("LEMD");
const MockErc20 = artifacts.require('MockERC20')
const Comptroller = artifacts.require("Comptroller")
const JumpRateModel = artifacts.require('JumpRateModel')
const LEther = artifacts.require('LEther')
const LERC20 = artifacts.require('LERC20')
const SimplePriceOracle = artifacts.require('SimplePriceOracle')
const LemdDistribution = artifacts.require('LemdDistribution')
const LemdToken = artifacts.require('LemdToken')
const LemdBreeder = artifacts.require('LemdBreeder')

const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))

async function main() {
    await hre.run("compile");

    this.deployer = (await ethers.getSigners())[0].address;
    console.log("deployer address", this.deployer);

    // Deploy LEMD token
    this.LEMD = await LEMD.new();
    console.log("LEMD", this.LEMD.address);

    // LemdBreeder
    this.lemdBreeder = await LemdBreeder.new(
        this.LEMD.address,
        this.deployer,
        "1000000000000000000",
        "0",
        "100",
        "5760",
        "999",
        "39"
    );
    console.log("lemdBreeder", this.lemdBreeder.address);

    // Grant miner role to lemdBreeder
    await this.LEMD.addMinter(this.lemdBreeder.address);
    console.log("lemdToken grantRole", this.lemdBreeder.address);

    // Price oracle
    this.priceOracle = await SimplePriceOracle.new();
    await this.priceOracle.initialize();
    console.log("priceOracle", this.priceOracle.address);

    // Comptroller
    this.comptroller = await Comptroller.new();
    await this.comptroller.initialize();
    console.log("comptroller", this.comptroller.address);

    // JumpRateModel
    this.jumpRateModel = await JumpRateModel.new();
    await this.jumpRateModel.initialize(
        hre.ethers.utils.parseEther("0.05"),
        hre.ethers.utils.parseEther("0.45"),
        hre.ethers.utils.parseEther("0.25"),
        hre.ethers.utils.parseEther("0.95")
    );
    console.log("jumpRateModel", this.jumpRateModel.address);

    // lTokens
    this.lEther = await LEther.new();
    await this.lEther.initialize(
        this.comptroller.address,
        this.jumpRateModel.address,
        hre.ethers.utils.parseEther("200000000"),
        "Lemond OKT",
        "lOKT",
        "18"
    );

    this.OKBAddress = "0xda9d14072ef2262c64240da3a93fea2279253611";
    this.lOKB = await LERC20.new();
    await this.lOKB.initialize(
        this.OKBAddress,
        this.comptroller.address,
        this.jumpRateModel.address,
        hre.ethers.utils.parseEther("200000000"),
        "Lemond OKB",
        "lOKB",
        "10"
    );

    this.USDTAddress = "0xe579156f9decc4134b5e3a30a24ac46bb8b01281";
    this.lUSDT = await LERC20.new();
    await this.lUSDT.initialize(
        this.USDTAddress,
        this.comptroller.address,
        this.jumpRateModel.address,
        hre.ethers.utils.parseEther("200000000"),
        "Lemond USDT",
        "lUSDT",
        "10"
    );

    this.ETHKAddress = "0xdf950cecf33e64176ada5dd733e170a56d11478e";
    this.lETHK = await LERC20.new();
    await this.lETHK.initialize(
        this.ETHKAddress,
        this.comptroller.address,
        this.jumpRateModel.address,
        hre.ethers.utils.parseEther("200000000"),
        "Lemond ETHK",
        "lETHK",
        "10"
    );

    this.BTCKAddress = "0x09973e7e3914eb5ba69c7c025f30ab9446e3e4e0";
    this.lBTCK = await LERC20.new();
    await this.lBTCK.initialize(
        this.BTCKAddress,
        this.comptroller.address,
        this.jumpRateModel.address,
        hre.ethers.utils.parseEther("200000000"),
        "Lemond BTCK",
        "lBTCK",
        "10"
    );
    console.log(
        "lTokens",
        this.lEther.address,
        this.lOKB.address,
        this.lETHK.address,
        this.lUSDT.address,
        this.lBTCK.address
    );

    // set Price
    const eth_address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    await this.priceOracle.setPrice(
        eth_address,
        hre.ethers.utils.parseEther("210")
    );
    await this.priceOracle.setPrice(
        this.OKBAddress,
        hre.ethers.utils.parseEther("20")
    );
    await this.priceOracle.setPrice(
        this.USDTAddress,
        hre.ethers.utils.parseEther("1")
    );
    await this.priceOracle.setPrice(
        this.ETHKAddress,
        hre.ethers.utils.parseEther("2000")
    );
    await this.priceOracle.setPrice(
        this.BTCKAddress,
        hre.ethers.utils.parseEther("60000")
    );
    await this.comptroller._setPriceOracle(this.priceOracle.address);
    console.log("set Price");

    // lToken setReserveFactor
    await this.lEther._setReserveFactor(hre.ethers.utils.parseEther("0.1"));
    await this.lOKB._setReserveFactor(hre.ethers.utils.parseEther("0.05"));
    await this.lETHK._setReserveFactor(hre.ethers.utils.parseEther("0.2"));
    await this.lUSDT._setReserveFactor(hre.ethers.utils.parseEther("0.1"));
    await this.lBTCK._setReserveFactor(hre.ethers.utils.parseEther("0.1"));
    console.log("setReserveFactor");

    // LemdDistribution
    this.lemdDistribution = await LemdDistribution.new();
    await this.lemdDistribution.initialize(
        this.LEMD.address,
        this.lemdBreeder.address,
        this.comptroller.address
    );

    // comptroller Config
    await this.comptroller._setMaxAssets("20");
    await this.comptroller._supportMarket(this.lEther.address);
    await this.comptroller._supportMarket(this.lOKB.address);
    await this.comptroller._supportMarket(this.lETHK.address);
    await this.comptroller._supportMarket(this.lUSDT.address);
    await this.comptroller._supportMarket(this.lBTCK.address);
    await this.comptroller._setCollateralFactor(
        this.lEther.address,
        hre.ethers.utils.parseEther("0.75")
    );
    await this.comptroller._setCollateralFactor(
        this.lOKB.address,
        hre.ethers.utils.parseEther("0.75")
    );
    await this.comptroller._setCollateralFactor(
        this.lETHK.address,
        hre.ethers.utils.parseEther("0.75")
    );
    await this.comptroller._setCollateralFactor(
        this.lUSDT.address,
        hre.ethers.utils.parseEther("0.75")
    );
    await this.comptroller._setCollateralFactor(
        this.lBTCK.address,
        hre.ethers.utils.parseEther("0.6")
    );
    await this.comptroller._setCloseFactor(hre.ethers.utils.parseEther("0.5"));
    await this.comptroller._setLiquidationIncentive(
        hre.ethers.utils.parseEther("1.05")
    );
    await this.comptroller._setLemdDistribution(this.lemdDistribution.address);
    await this.comptroller._setDistributeLemdPaused(true);
    await this.comptroller.enterMarkets([
        this.lEther.address,
        this.lOKB.address,
        this.lUSDT.address,
        this.lETHK.address,
        this.lBTCK.address,
    ]);
    console.log("comptroller Config");

    // set lTokens speed and set lemdDistribution config
    await this.lemdDistribution._setLemdSpeed(
        this.lEther.address,
        hre.ethers.utils.parseEther("1")
    );
    await this.lemdDistribution._setLemdSpeed(
        this.lOKB.address,
        hre.ethers.utils.parseEther("1")
    );
    await this.lemdDistribution._setLemdSpeed(
        this.lUSDT.address,
        hre.ethers.utils.parseEther("1")
    );
    await this.lemdDistribution._setLemdSpeed(
        this.lETHK.address,
        hre.ethers.utils.parseEther("1")
    );
    await this.lemdDistribution._setLemdSpeed(
        this.lBTCK.address,
        hre.ethers.utils.parseEther("1")
    );
    await this.comptroller._setDistributeLemdPaused(false);
    await this.lemdDistribution._setEnableAll(true);

    console.log("End");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
