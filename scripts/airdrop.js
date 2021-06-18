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
const AIRDROP = artifacts.require("Airdrop")

async function main() {
    await hre.run("compile")

    this.deployer = (await ethers.getSigners())[0].address
    console.log("deployer address", this.deployer)


    // Deploy LEMD token
    // this.LEMD = await LEMD.new()
    // console.log("LEMD", this.LEMD.address)

    // this.AIRDROP = await AIRDROP.new(this.LEMD.address, 0) //1624626000
    // console.log("AIRDROP", this.AIRDROP.address)

    // await this.LEMD.addMinter(this.AIRDROP.address)
    // await this.AIRDROP.getAirdrop()
    // await this.AIRDROP.getPrize()

    // console.log("amount", (await this.AIRDROP.amounts(this.deployer)).toString())
    // console.log("ticket", (await this.AIRDROP.tickets(1)).toString())
    // console.log("getPrize", (await this.LEMD.balanceOf(this.deployer)).toString())

    console.log("End")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
