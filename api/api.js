import axios from 'axios'

export const getPrice = async() => {
    const request  = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=lemond,bitcoin,ethereum,okb,okexchain,tether&vs_currencies=usd")
    return request
}

export const getTotalValueLocked = async () => {
    const request = await axios.get("/api/getTotalValueLocked")
    return request
}

export const getLendInfo = async () => {
    const request = await axios.get("/api/getLendInfo")
    return request
}