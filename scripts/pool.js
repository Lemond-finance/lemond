// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat")
const { ethers, upgrades } = require("hardhat")
const BigNumber = require("bignumber.js")
const web3 = require("web3")

const OKTPool = artifacts.require("./OKTPool")
const LEMD = artifacts.require("./LEMD")

async function main() {
    await hre.run("compile")

    this.deployer = (await ethers.getSigners())[0].address
    console.log("deployer address", this.deployer)

    // 1. Deploy LEMD token
    this.LEMD = await LEMD.new()
    console.log("LEMD", this.LEMD.address)

    // 2. Deploy OKT Pool contract
    this.oktPool = await OKTPool.new(
        this.LEMD.address,
        "0x0000000000000000000000000000000000000000",
        1615550400,
    )
    console.log("OKTPool", this.oktPool.address)

    await this.LEMD.addMinter(this.deployer)
    console.log("addMinter")
    await this.oktPool.setRewardDistribution(this.deployer)
    console.log("setRewardDistribution")
    await this.oktPool.notifyRewardAmount(
        hre.ethers.utils.parseEther("1000000"),
    )
    console.log("notifyRewardAmount")
    await this.LEMD.mint(
        this.oktPool.address,
        hre.ethers.utils.parseEther("1000000"),
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
