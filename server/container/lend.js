import db from "../database/db.js"
import web3 from "web3"
import { initWeb3, initContract } from '../libs/utils'
import tokenConfig from '../../contract.config'

const Lend = db.Lend

export async function getLendInfo(req, res) {
    const web3 = initWeb3()
    const { OKT, OKB, USDT, ETHK, BTCK } = tokenConfig.lend.tokens
    const { lEther, lOKB, lUSDT, lETHK, lBTCK } = tokenConfig.lend.lTokens
    let callBackData = {
        success: true,
        status: 200,
        message: "Success",
        data: null,
    }
    res.send(callBackData)
}