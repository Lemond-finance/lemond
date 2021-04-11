// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat")
const { ethers, upgrades } = require("hardhat")
const BigNumber = require("bignumber.js")
const web3 = require("web3")

const Comptroller = artifacts.require("Comptroller")
const LEther = artifacts.require("LEther")


async function main() {
    await hre.run("compile")

    this.deployer = (await ethers.getSigners())[0].address
    console.log("deployer address", this.deployer)

    const contract = await hre.ethers.getContractAt("Comptroller", "0xB862D3d472fD427f4D9E2424C272c5425546f1C3")
    console.log((await contract.getAccountLiquidity(this.deployer))[1].toString())

    // this.lEther = await hre.ethers.getContractAt("LEther", "0xd5ef09E50d38E1a427a057830Bf5D7A0304a2FD7")
    // await this.lEther.mint({ value: hre.ethers.utils.parseEther("1"), })
    // await this.lEther.borrow(hre.ethers.utils.parseEther("0.2"))

    console.log("End")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
