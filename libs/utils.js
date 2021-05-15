import { utils } from 'web3'
// import {utils} from 'ethers'
import BigNumber from 'bignumber.js'
import numbro from "numbro"


export function formatNumber(number, digits, decimals){
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

export function formatUSDNmuber(number, decimals){
   return numbro(number).formatCurrency({
       average: true,
       mantissa: decimals,
   })
}

export function formatThousandNumber(number, decimals) {
    const num = Math.floor(number * 100000000) / 100000000
    return numbro(num).format({
        thousandSeparated: true,
        mantissa: decimals,
    })
}

export function formatAverageNumber(number, decimals) {
    return numbro(number).formatCurrency({
        average: true,
        mantissa: decimals,
    })
}

export function unFormatNumber(number, decimals) {
    const bn = new BigNumber(String(number))
    return numbro(bn.times(new BigNumber(10).pow(decimals))).format({
        mantissa: 0,
    })
}

export function formatDecimals(number, decimals) {
    const bn = new BigNumber(String(number))
    return numbro(bn).format({
        mantissa: decimals,
    })
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