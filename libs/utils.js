// import { utils } from 'web3'
import {utils} from 'ethers'
import BigNumber from 'bignumber.js'
import numeral from 'numeral'


export function fromWeiNumber(number) {
  const bn = new BigNumber(String(number))
  return numeral(bn.div(new BigNumber(10).pow(18))).format('0,0.0000')
}

export function fromETHWeiNumber(number) {
  const bn = new BigNumber(String(number))
  return bn.div(new BigNumber(10).pow(18)).toString()
}

export function fromUSDNumber(number) {
   const bn = new BigNumber(String(number))
  return numeral(bn.div(new BigNumber(10).pow(18))).format('$0,0.0000')
}

export function fromUSD(number) {
  return numeral(number).format('$0,0.0000')
}

export function toWeiNumber(number) {
  const bn = new BigNumber(String(number))
  return bn.times(new BigNumber(10).pow(18)).toFixed()
}


export const toastConfig = {
                      position: 'bottom-left',
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      draggable: true,
                      progress: null,
                    }