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

    // const LEMD = await hre.ethers.getContractAt("LEMD", "0xE667d8bD182D165D2E71cF72315bD117f6940094")
    // console.log(LEMD.address)
    // await LEMD.addMinter(this.deployer)
    // await LEMD.mint("0xDa755D8cAfc0e731245415d3da9748EB92D87CaC", hre.ethers.utils.parseEther("1000000"))

    // this.priceOracle = await hre.ethers.getContractAt("SimplePriceOracle", "0xd34D6798bedd8BB50C0cA67Aaad3F235D168D0a3")
    // await this.priceOracle.setPrice("0xe579156f9dEcc4134B5E3A30a24Ac46BB8B01281", hre.ethers.utils.parseEther("1"))

    // this.lUSDT = await hre.ethers.getContractAt("LERC20", "0xf5799c87C0f996B17DC0556dB0b4C48211367A7E")
    // await this.lUSDT.mint(hre.ethers.utils.parseEther("1"))

    // this.lemdDistribution = await hre.ethers.getContractAt("LemdDistribution", "0x0533259C3DB98220059B34eC9D5Cf38705E3A578")
    // const pendingLemdAccrued = await this.lemdDistribution.pendingLemdAccrued(this.deployer, true, true)
    // console.log(hre.ethers.utils.formatEther(pendingLemdAccrued.toString()))
    // console.log(hre.ethers.utils.formatEther((await LEMD.balanceOf(this.deployer)).toString()))
    // await this.lemdDistribution.claimLemd(this.deployer)
    // console.log(hre.ethers.utils.formatEther((await LEMD.balanceOf(this.deployer)).toString()))

    // this.comptroller = await hre.ethers.getContractAt("Comptroller", "0x12F2d7D1dd0Ff12584FCf8A7996fF4F70d74963f")
    // await this.comptroller._setBorrowPaused("0x3C39Eb941db646982e4691446f6aB60d737919bc",true)
    // await this.comptroller._setBorrowPaused("0x078baA86150286CC6e29Ec6B746593c14c7A82d3", true)
    // await this.comptroller._setBorrowPaused("0x54aecD365dB9F67bE5C9B6AE3F504e2e95604eB9", true)
    // await this.comptroller._setBorrowPaused("0xdc1e9B17EcF09EC52748f35059251FFb03a571c9", true)
    // console.log(await this.comptroller.lTokenBorrowGuardianPaused("0x3C39Eb941db646982e4691446f6aB60d737919bc"))

    // console.log((await this.comptroller.getMaxInvitedMintAmount("0xAE2c8C4CB3CD69D0Dfa4490c024b6b1aEC64223f")).toString())
    // console.log((await this.comptroller.getInvitedMintAmount("0xAE2c8C4CB3CD69D0Dfa4490c024b6b1aEC64223f")).toString())
    // await this.comptroller._setDistributeLemdPaused(false)
    // await LEMD.addMinter(this.deployer)
    // await LEMD.mint("0xd4ac6586e85B9d2DD64f7BD5597C54996f13abe8", hre.ethers.utils.parseEther("500000"))
    // console.log("LemdBreeder lemdToken", (await this.lemdToken.balanceOf("0xd4ac6586e85B9d2DD64f7BD5597C54996f13abe8")).toString())


    this.priceOracle = await hre.ethers.getContractAt("SimplePriceOracle", "0x1B0e0d095A5d8721E2d3b5dcD43dE29791164FCF")
    // await this.priceOracle.setUnderlyingPrice("0x01b2E0845E2F711509b664CD0aD0b85E43d01878", hre.ethers.utils.parseEther("555"))
    // await this.priceOracle.setUnderlyingPrice("0x3C39Eb941db646982e4691446f6aB60d737919bc", hre.ethers.utils.parseEther("277198"))
    // await this.priceOracle.setUnderlyingPrice("0x078baA86150286CC6e29Ec6B746593c14c7A82d3", hre.ethers.utils.parseEther("1"))
    // await this.priceOracle.setUnderlyingPrice("0x54aecD365dB9F67bE5C9B6AE3F504e2e95604eB9", hre.ethers.utils.parseEther("35532"))
    // await this.priceOracle.setUnderlyingPrice("0xdc1e9B17EcF09EC52748f35059251FFb03a571c9", hre.ethers.utils.parseEther("46"))
    console.log(hre.ethers.utils.formatEther((await this.priceOracle.getUnderlyingPrice("0x01b2E0845E2F711509b664CD0aD0b85E43d01878")).toString()))
    console.log(hre.ethers.utils.formatEther((await this.priceOracle.getUnderlyingPrice("0x3C39Eb941db646982e4691446f6aB60d737919bc")).toString()))
    console.log(hre.ethers.utils.formatEther((await this.priceOracle.getUnderlyingPrice("0x078baA86150286CC6e29Ec6B746593c14c7A82d3")).toString()))
    console.log(hre.ethers.utils.formatEther((await this.priceOracle.getUnderlyingPrice("0x54aecD365dB9F67bE5C9B6AE3F504e2e95604eB9")).toString()))
    console.log(hre.ethers.utils.formatEther((await this.priceOracle.getUnderlyingPrice("0xdc1e9B17EcF09EC52748f35059251FFb03a571c9")).toString()))

    // this.lemdDistribution = await hre.ethers.getContractAt("LemdDistribution", "0xd4ac6586e85B9d2DD64f7BD5597C54996f13abe8")
    // await this.lemdDistribution._setEnableDistributeMintLemd(true)
    // await this.lemdDistribution._setEnableDistributeRedeemLemd(true)
    // await this.lemdDistribution._setEnableDistributeBorrowLemd(true)
    // await this.lemdDistribution._setEnableDistributeRepayBorrowLemd(true)
    // await this.lemdDistribution._setLemdSpeed("0x01b2E0845E2F711509b664CD0aD0b85E43d01878", hre.ethers.utils.parseEther("5"))
    // await this.lemdDistribution._setLemdSpeed("0x3C39Eb941db646982e4691446f6aB60d737919bc", hre.ethers.utils.parseEther("0.05"))
    // await this.lemdDistribution._setLemdSpeed("0x078baA86150286CC6e29Ec6B746593c14c7A82d3", hre.ethers.utils.parseEther("0.05"))
    // await this.lemdDistribution._setLemdSpeed("0x54aecD365dB9F67bE5C9B6AE3F504e2e95604eB9", hre.ethers.utils.parseEther("0.05"))
    // await this.lemdDistribution._setLemdSpeed("0xdc1e9B17EcF09EC52748f35059251FFb03a571c9", hre.ethers.utils.parseEther("0.05"))

    console.log("End")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
