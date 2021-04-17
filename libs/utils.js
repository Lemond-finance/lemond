// import { utils } from 'web3'
import {utils} from 'ethers'
import BigNumber from 'bignumber.js'
import numbro from "numbro"


export function formatNmuber(number, digits, decimals){
  const bn = new BigNumber(String(number))
  return numbro(bn.div(new BigNumber(10).pow(digits))).format({
      thousandSeparated: true,
      mantissa: decimals,
  })
}

export function formatStringNumber(number, digits) {
    const bn = new BigNumber(String(number))
    return bn.div(new BigNumber(10).pow(digits)).toString()
}

export function fromWeiNumber(number) {
  const bn = new BigNumber(String(number))
  return numbro(bn.div(new BigNumber(10).pow(18))).format({
      thousandSeparated: true,
      mantissa: 2,
  })
}

export function from10WeiNumber(number) {
    const bn = new BigNumber(String(number))
    return numbro(bn.div(new BigNumber(10).pow(10))).format({
      thousandSeparated: true,
      mantissa: 2,
  })
}

export function fromETHWeiNumber(number) {
  const bn = new BigNumber(String(number))
  return bn.div(new BigNumber(10).pow(18)).toString()
}

export function fromFormatETHWeiNumber(number) {
    const bn = new BigNumber(String(number))
    return numbro(bn.div(new BigNumber(10).pow(18))).format({
      thousandSeparated: true,
      mantissa: 8,
  })
}

export function from10ETHWeiNumber(number) {
    const bn = new BigNumber(String(number))
    return bn.div(new BigNumber(10).pow(10)).toString()
}

export function from10FormatETHWeiNumber(number) {
    const bn = new BigNumber(String(number))
    return numbro(bn.div(new BigNumber(10).pow(10))).format({
      thousandSeparated: true,
      mantissa: 8,
  })
}

export function fromUSDNumber(number) {
   const bn = new BigNumber(String(number))
  return numbro(bn.div(new BigNumber(10).pow(18))).formatCurrency({ mantissa: 2 })
}

export function fromUSD(number) {
  return numbro(number).formatCurrency({ mantissa: 2 })
}

export function formatUSDNumer(number) {
    return numbro(number).formatCurrency({
      average: true,
      mantissa: 2 
    })
}

export function toWeiNumber(number) {
  const bn = new BigNumber(String(number))
  return returnInteger(bn.times(new BigNumber(10).pow(18)))
}

export function to10WeiNumber(number) {
    const bn = new BigNumber(String(number))
    return returnInteger(bn.times(new BigNumber(10).pow(10)))
}

export function fromAPY(number) {
    return numbro(number).format({
      thousandSeparated: true,
      mantissa: 2,
  })
}

export function fromBigNumber(number) {
    const bn = new BigNumber(String(number))
    return bn.toString()
}

export function fromFormatBigNumber(number) {
    const bn = new BigNumber(String(number))
    return numbro(bn.toString()).format({
      thousandSeparated: true,
      mantissa: 8,
  })
}

export function returnInteger(number){
  const bn = new BigNumber(String(number))
  if (!bn.isInteger()) {
      return bn.integerValue(BigNumber.ROUND_DOWN).toString()
  }
  return bn.toString()
}


export const toastConfig = {
    position: "bottom-left",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    progress: null,
    pauseOnHover: false,
}