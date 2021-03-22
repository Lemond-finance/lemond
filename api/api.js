import axios from 'axios'

export const getDOMOPrice = async() => {
  try {
    const {data} = await axios.get('https://api.0x.org/swap/v1/price?sellToken=0x77c329b7c9e2632a77aca45074d92ab027898c0e&buyToken=USDT&sellAmount=1000000000000000000')
    return data.price
  } catch (error) {
    return 0
  }
}

export const getWETHPrice = async () => {
  try {
    const { data } = await axios.get('https://api.0x.org/swap/v1/price?sellToken=ETH&buyToken=USDT&sellAmount=1000000000000000000')
    return data.price
  } catch (error) {
    return 0
  }
}

export const getWBTCPrice = async () => {
  try {
    const { data } = await axios.get('https://api.0x.org/swap/v1/price?sellToken=WBTC&buyToken=USDT&sellAmount=1000000000000000000')
    return data.price
  } catch (error) {
    return 0
  }
}
