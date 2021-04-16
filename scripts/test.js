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

    // const contract = await hre.ethers.getContractAt("Comptroller", "0x4E51117Fc621408A418444681694Fb26a597e8a1")
    // await contract
    //     .exitMarket("0x21c18ABbA470dD3bd59574fA373c650c45F52C82", {
    //         from: this.deployer,
    //     })
    // console.log((await contract.getAssetsIn(this.deployer)).toString())

    // this.lEther = await hre.ethers.getContractAt("LEther", "0xd5ef09E50d38E1a427a057830Bf5D7A0304a2FD7")
    // await this.lEther.mint({ value: hre.ethers.utils.parseEther("1"), })
    // await this.lEther.borrow(hre.ethers.utils.parseEther("0.2"))

    const LEMD = await hre.ethers.getContractAt("LEMD", "0x784503921c877Df8E228189601BB71C628593A87")
    // await LEMD.addMinter(this.deployer)
    // await LEMD.mint("0xDa755D8cAfc0e731245415d3da9748EB92D87CaC", hre.ethers.utils.parseEther("1000000"))

    // this.priceOracle = await hre.ethers.getContractAt("SimplePriceOracle", "0xd34D6798bedd8BB50C0cA67Aaad3F235D168D0a3")
    // await this.priceOracle.setPrice("0xe579156f9dEcc4134B5E3A30a24Ac46BB8B01281", hre.ethers.utils.parseEther("1"))

    // this.lUSDT = await hre.ethers.getContractAt("LERC20", "0xf5799c87C0f996B17DC0556dB0b4C48211367A7E")
    // await this.lUSDT.mint(hre.ethers.utils.parseEther("1"))

    
    this.lemdDistribution = await hre.ethers.getContractAt("LemdDistribution", "0x0533259C3DB98220059B34eC9D5Cf38705E3A578")
    const pendingLemdAccrued = await this.lemdDistribution.pendingLemdAccrued(this.deployer, true, true)
    console.log(hre.ethers.utils.formatEther(pendingLemdAccrued.toString()))
    console.log(hre.ethers.utils.formatEther((await LEMD.balanceOf(this.deployer)).toString()))
    await this.lemdDistribution.claimLemd(this.deployer)
    console.log(hre.ethers.utils.formatEther((await LEMD.balanceOf(this.deployer)).toString()))
    
    
    console.log("End")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
