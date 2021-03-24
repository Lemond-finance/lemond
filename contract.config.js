import oktPool from './abi/OKTPool.json'
import lemond from './abi/LEMD.json'
import ONOTAirdrop from './abi/ONOTAirdrop.json'

export default {
  stake:{
    okt: {
      name: "LEMD Genesis Pool",
      description: "Get OKT Token",
      icon: "icon_domo_eth",
      link: "https://gitter.im/okexchain-testnet/faucet",
      address: '0x2c91AA5F6586e9E13D4EC50dA16b336beC448BCf',
      abi: oktPool,
      speed: "Genesis"
    }
  },
  token: {
    lemond: {
      address: '0xE667d8bD182D165D2E71cF72315bD117f6940094',
      abi: lemond
    }
  }, 
  pool: {
    okt_pool: {
      address: '0x6eF0adF5dB077FE8A69f94D25e4EF29a0726e779',
      abi: oktPool
    }
  },
  airdrop: {
    onto: {
      address: '0x29CC41E332468b0D8a4a06BE07FDb4dD2400c0dD',
      abi: ONOTAirdrop
    }
  }
}