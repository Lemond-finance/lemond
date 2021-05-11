import db from "../database/db.js"
import web3 from "web3"
import { initWeb3, initContract } from '../libs/utils'
import tokenConfig from '../../contract.config'
import axios from 'axios'
import BigNumber from "bignumber.js"
import { getPrice } from '../../api/api'

const Lend = db.Lend

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