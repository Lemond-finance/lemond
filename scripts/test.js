// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat")
const { ethers, upgrades } = require("hardhat")
const BigNumber = require("bignumber.js")
const web3 = require("web3")

const LEMD = artifacts.require("LEMD")
const Comptroller = artifacts.require("Comptroller")
const LEther = artifacts.require("LEther")
const LERC20 = artifacts.require("LERC20")
const SimplePriceOracle = artifacts.require("SimplePriceOracle")


async function main() {
    await hre.run("compile")

    this.deployer = (await ethers.getSigners())[0].address
    console.log("deployer address", this.deployer)

    // const contract = await hre.ethers.getContractAt("Comptroller", "0xB862D3d472fD427f4D9E2424C272c5425546f1C3")
    // console.log((await contract.getAccountLiquidity(this.deployer))[1].toString())

    // this.lEther = await hre.ethers.getContractAt("LEther", "0xd5ef09E50d38E1a427a057830Bf5D7A0304a2FD7")
    // await this.lEther.mint({ value: hre.ethers.utils.parseEther("1"), })
    // await this.lEther.borrow(hre.ethers.utils.parseEther("0.2"))

    // const LEMD = await hre.ethers.getContractAt("LEMD", "0x4d80d22f8c422cedaf833b92ca0af627c6839067")
    // await LEMD.addMinter(this.deployer)
    // await LEMD.mint("0xc893F17BE5b3Ac3EbCA86073007439196F59E567", hre.ethers.utils.parseEther("10000"))

    // this.priceOracle = await hre.ethers.getContractAt("SimplePriceOracle", "0xd34D6798bedd8BB50C0cA67Aaad3F235D168D0a3")
    // await this.priceOracle.setPrice("0xe579156f9dEcc4134B5E3A30a24Ac46BB8B01281", hre.ethers.utils.parseEther("1"))

    this.lUSDT = await hre.ethers.getContractAt("LERC20", "0xf5799c87C0f996B17DC0556dB0b4C48211367A7E")
    await this.lUSDT.mint(hre.ethers.utils.parseEther("1"))

    console.log("End")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
