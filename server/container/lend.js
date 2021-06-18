import db from "../database/db.js"
import web3 from "web3"
import { ethers } from "ethers"
import { initWeb3, initContract } from '../libs/utils'
import tokenConfig from '../../contract.config'
import axios from 'axios'
import BigNumber from "bignumber.js"
import { getPrice } from '../../api/api'
import fs from "fs"

const Op = db.Op
const Lend = db.Lend
const Airdrop = db.Airdrop


export async function airdrop(req, res) {
    const { address, telegram, twitter, tweet } = req.query

    const findResult = await Airdrop.findAll({
        where: {
            [Op.or]: [{ address: address }, { telegram: telegram }, { twitter: twitter }, { tweet: tweet }],
        },
    })

    let callBackData = {
        success: true,
        status: 200,
        message: "Success",
        data: null,
    }

    // console.log("findResult.length", findResult.length)

    // if(findResult.length > 0){
    //     callBackData = {
    //         success: false,
    //         status: 200,
    //         message: "Fail",
    //         data: null,
    //     }
    //     res.status(200)
    //     res.json(callBackData)
    //     return
    // }

    const result = await Airdrop.create({
        address: address,
        telegram: telegram,
        twitter: twitter,
        tweet: tweet,
        status: 1,
    })
    res.status(200)
    res.json(callBackData)
}

export async function getTotalValueLocked(req, res) {
    const result = await Lend.sum("market_size")
    let callBackData = {
        success: true,
        status: 200,
        message: "Success",
        data: result,
    }
    res.status(200)
    res.json(callBackData)
}

export async function getLendInfo(req, res) {
    const result = await Lend.findAll()
    let callBackData = {
        success: true,
        status: 200,
        message: "Success",
        data: result,
    }
    res.status(200)
    res.json(callBackData)
}

export async function updateLendTotalInfo(req,res) {
    try {
        const { OKT, OKB, USDT, ETHK, BTCK } = tokenConfig.lend.tokens
        const { lEther, lOKB, lUSDT, lETHK, lBTCK } = tokenConfig.lend.lTokens
        const { lemdDistribution } = tokenConfig.lend.controller
        const { data } = await getPrice()
        await getLendInfoFromToken(OKT.abi, OKT.address, lEther.abi, lEther.address, lemdDistribution.abi, lemdDistribution.address, data?.lemond?.usd, data?.okexchain?.usd, "")
        await getLendInfoFromToken(OKB.abi, OKB.address, lOKB.abi, lOKB.address, lemdDistribution.abi, lemdDistribution.address, data?.lemond?.usd, data?.okb?.usd, "")
        await getLendInfoFromToken(USDT.abi, USDT.address, lUSDT.abi, lUSDT.address, lemdDistribution.abi, lemdDistribution.address, data?.lemond?.usd, data?.tether?.usd, "")
        await getLendInfoFromToken(ETHK.abi, ETHK.address, lETHK.abi, lETHK.address, lemdDistribution.abi, lemdDistribution.address, data?.lemond?.usd, data?.ethereum?.usd, "")
        await getLendInfoFromToken(BTCK.abi, BTCK.address, lBTCK.abi, lBTCK.address, lemdDistribution.abi, lemdDistribution.address, data?.lemond?.usd, data?.bitcoin?.usd, "")
        let callBackData = {
            message: "Success",
            data: null,
        }
        res.status(200)
        res.json(callBackData)
    } catch (error) {
        res.status(400)
        res.json({ message: "Bad Request", error: error })
    }
}

export async function getLendInfoFromToken(tokenAbi, tokenAddress, lTokenAbi, lTokenAddress, lemdDistributionAbi, lemdDistributionAddress, lemdPrice,tokenPrice, account) {
    const web3 = initWeb3()
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress)
    const lTokenContract = new web3.eth.Contract(lTokenAbi, lTokenAddress)
    const lemdDistributionContract = new web3.eth.Contract(lemdDistributionAbi, lemdDistributionAddress)
    var digits = 10
    var ethMantissa = 1e10
    var tokenName
    if (tokenAddress == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        digits = 18
        ethMantissa = 1e18
        tokenName = "OKT"
    }else{
        tokenName = await tokenContract.methods.name().call()
    }
    const blocksPerDay = 17 * 60 * 24
    const daysPerYear = 365
    tokenPrice = new BigNumber(tokenPrice).times(new BigNumber(10).pow(18))
    console.log(tokenPrice)
    const supplyRatePerBlock = await lTokenContract.methods.supplyRatePerBlock().call()
    const borrowRatePerBlock = await lTokenContract.methods.borrowRatePerBlock().call()
    const supplyApy = ((Math.pow((supplyRatePerBlock / 1e18) * blocksPerDay + 1, daysPerYear) - 1) * 100).toFixed(2)
    console.log("supplyApy", supplyApy)
    const borrowApy = (((borrowRatePerBlock / 1e18) * blocksPerDay + 1) * 100).toFixed(2)
    console.log("borrowApy", borrowApy)
    const totalSupply = await lTokenContract.methods.totalSupply().call()
    console.log("totalSupply", totalSupply)
    const exchangeRate = (await lTokenContract.methods.exchangeRateCurrent().call()) / ethMantissa
    console.log("exchangeRate", exchangeRate)
    const marketSize = new BigNumber(totalSupply).times(exchangeRate).times(tokenPrice).div(new BigNumber(10).pow(18)).div(new BigNumber(10).pow(18)).toFixed(2)
    console.log("marketSize", marketSize)
    const totalBorrowsCurrent = await lTokenContract.methods.totalBorrowsCurrent().call()
    console.log("totalBorrowsCurrent", totalBorrowsCurrent)
    const totalBorrow = new BigNumber(totalBorrowsCurrent).div(new BigNumber(10).pow(digits)).times(tokenPrice).div(new BigNumber(10).pow(18)).toFixed(2)
    console.log("totalBorrow", totalBorrow)
    const lemdSpeedPerBlock = new BigNumber(await lemdDistributionContract.methods.lemdSpeeds(lTokenAddress).call()).div(new BigNumber(10).pow(18)).times(lemdPrice)
    console.log("lemdSpeed", lemdSpeedPerBlock.toFixed())
    const supplyRewardAPY = new BigNumber(lemdSpeedPerBlock).times(blocksPerDay).times(daysPerYear).times(lemdPrice).div(marketSize).times(100).toFixed(2)
    const borrowRewardAPY = new BigNumber(lemdSpeedPerBlock).times(blocksPerDay).times(daysPerYear).times(lemdPrice).div(totalBorrow).times(100).toFixed(2)
    console.log("supplyRewardAPY", supplyRewardAPY)
    console.log("borrowRewardAPY", borrowRewardAPY)
    const totalSupplyAPY = parseFloat(supplyApy) + parseFloat(supplyRewardAPY == Infinity ? 0 : supplyRewardAPY)
    const totalBorrowAPY = parseFloat(borrowApy) - parseFloat(borrowRewardAPY == Infinity ? 0 : borrowRewardAPY)
    console.log("totalSupplyAPY", totalSupplyAPY)
    console.log("totalBorrowAPY", totalBorrowAPY)
    const selectIndex = await Lend.findOne({
        attributes: ["id"],
        where: {
            token_name: tokenName,
        },
    })
    const insertLendInfo = await Lend.upsert({
        id: selectIndex ? selectIndex.id : null,
        token_name: tokenName,
        market_size: marketSize,
        total_borrow: totalBorrow,
        deposit_total_apy: totalSupplyAPY,
        borrow_total_apy: totalBorrowAPY,
        supply_apy: supplyApy,
        supply_distribution_apy: supplyRewardAPY,
        borrow_apy: borrowApy,
        borrow_distribution_apy: borrowRewardAPY,
        status: 1,
    })

}

export async function updatePriceOracle(req, res) {
    try {
        const web3 = initWeb3()
        const { priceOracle } = tokenConfig.lend.controller
        web3.eth.accounts.wallet.create(1, "54674321§3456764321§345674321§3453647544±±±§±±±!!!43534534534534")
        const mnemonic = fs.readFileSync(".secret").toString().trim()
        web3.eth.accounts.wallet.add(mnemonic)
        this.priceOracle = new web3.eth.Contract(priceOracle.abi, priceOracle.address)
        await this.priceOracle.methods
            .setUnderlyingPrice("0x01b2E0845E2F711509b664CD0aD0b85E43d01878", ethers.utils.parseEther("555"))
            .send({ from: "0xe395900A078D6d7EFFAf8A805e2dC0d18c2865CE", gas: 200000 })
        await this.priceOracle.methods
            .setUnderlyingPrice("0x3C39Eb941db646982e4691446f6aB60d737919bc", ethers.utils.parseEther("277198"))
            .send({ from: "0xe395900A078D6d7EFFAf8A805e2dC0d18c2865CE", gas: 200000 })
        await this.priceOracle.methods
            .setUnderlyingPrice("0x078baA86150286CC6e29Ec6B746593c14c7A82d3", ethers.utils.parseEther("1"))
            .send({ from: "0xe395900A078D6d7EFFAf8A805e2dC0d18c2865CE", gas: 200000 })
        await this.priceOracle.methods
            .setUnderlyingPrice("0x54aecD365dB9F67bE5C9B6AE3F504e2e95604eB9", ethers.utils.parseEther("35532"))
            .send({ from: "0xe395900A078D6d7EFFAf8A805e2dC0d18c2865CE", gas: 200000 })
        await this.priceOracle.methods
            .setUnderlyingPrice("0xdc1e9B17EcF09EC52748f35059251FFb03a571c9", ethers.utils.parseEther("46"))
            .send({ from: "0xe395900A078D6d7EFFAf8A805e2dC0d18c2865CE", gas: 200000 })
        console.log(ethers.utils.formatEther((await this.priceOracle.methods.getUnderlyingPrice("0x01b2E0845E2F711509b664CD0aD0b85E43d01878").call()).toString()))
        console.log(ethers.utils.formatEther((await this.priceOracle.methods.getUnderlyingPrice("0x3C39Eb941db646982e4691446f6aB60d737919bc").call()).toString()))
        console.log(ethers.utils.formatEther((await this.priceOracle.methods.getUnderlyingPrice("0x078baA86150286CC6e29Ec6B746593c14c7A82d3").call()).toString()))
        console.log(ethers.utils.formatEther((await this.priceOracle.methods.getUnderlyingPrice("0x54aecD365dB9F67bE5C9B6AE3F504e2e95604eB9").call()).toString()))
        console.log(ethers.utils.formatEther((await this.priceOracle.methods.getUnderlyingPrice("0xdc1e9B17EcF09EC52748f35059251FFb03a571c9").call()).toString()))
    } catch (error) {
        res.status(400)
        res.json({ message: "Bad Request", error: error })
    }
}