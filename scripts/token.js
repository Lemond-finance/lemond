// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat")
const { ethers, upgrades } = require("hardhat")
const BigNumber = require("bignumber.js")
const web3 = require("web3")

const LEMD = artifacts.require("LEMDCap")
const LEMDLimit = artifacts.require("LEMDLimit")

async function main() {
    await hre.run("compile")

    this.deployer = (await ethers.getSigners())[0].address
    console.log("deployer address", this.deployer)

    // Deploy LEMD token
    // this.LEMD = await LEMD.new(hre.ethers.utils.parseEther("10000"))
    // console.log("LEMD", this.LEMD.address)

    // console.log((await this.LEMD.balanceOf(this.deployer)).toString())

    // await this.LEMD.addMinter(this.deployer)
    // await this.LEMD.mint(this.deployer, hre.ethers.utils.parseEther("1000"))
    // console.log(hre.ethers.utils
    //         .formatEther((await this.LEMD.balanceOf(this.deployer)).toString()).toString())

    // await this.LEMD.mint(this.deployer, hre.ethers.utils.parseEther("9001"))

    // console.log("LEMD Limit")

    // this.LEMDLimit = await LEMDLimit.new(1618463835)
    // console.log("LEMDLimit", this.LEMDLimit.address)

    // await this.LEMDLimit.addMinter(this.deployer)
    // await this.LEMDLimit.mint(this.deployer, hre.ethers.utils.parseEther("1000"))
    // await this.LEMDLimit.mint("0xaf4944eBFEc95497f1A1D3B1a955ABbe828f842b", hre.ethers.utils.parseEther("1000"))
    // console.log(hre.ethers.utils.formatEther((await this.LEMDLimit.balanceOf(this.deployer)).toString()).toString())
    // console.log(hre.ethers.utils.formatEther((await this.LEMDLimit.balanceOf("0xaf4944eBFEc95497f1A1D3B1a955ABbe828f842b")).toString()).toString())

    // await this.LEMDLimit.transfer("0xaf4944eBFEc95497f1A1D3B1a955ABbe828f842b", hre.ethers.utils.parseEther("500"))

    // console.log(hre.ethers.utils.formatEther((await this.LEMDLimit.balanceOf(this.deployer)).toString()).toString())
    // console.log(hre.ethers.utils.formatEther((await this.LEMDLimit.balanceOf("0xaf4944eBFEc95497f1A1D3B1a955ABbe828f842b")).toString()).toString())

    // await this.LEMDLimit.initialize(1619089200)

    // await this.LEMDLimit.transfer("0xaf4944eBFEc95497f1A1D3B1a955ABbe828f842b", hre.ethers.utils.parseEther("500"))
    // console.log(hre.ethers.utils.formatEther((await this.LEMDLimit.balanceOf(this.deployer)).toString()).toString())
    // console.log(hre.ethers.utils.formatEther((await this.LEMDLimit.balanceOf("0xaf4944eBFEc95497f1A1D3B1a955ABbe828f842b")).toString()).toString())    


    console.log("LEMD Limit Deploy")
    this.LEMDLimit = await LEMDLimit.new(1619089200)
    console.log("LEMDLimit", this.LEMDLimit.address)

    console.log("End")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
