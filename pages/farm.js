import Head from "next/head"
import useWallet from "use-wallet"
import { Link, withTranslation } from "../i18n"
import React, { useState, useEffect } from "react"
import HeaderFooter from "../layout/HeaderFooter"
import classNames from "classnames/bind"
import styles from "../styles/farm.less"
import { confirmAlert } from 'react-confirm-alert'
import { ToastContainer, toast } from 'react-toastify'
import { toastConfig } from '../libs/utils'
import Timer from 'react-compound-timer'
import BigNumber from 'bignumber.js'
import { withRouter } from 'next/router'
import Clipboard from 'react-clipboard.js'
import '../styles/react-confirm-alert.less'
const cx = classNames.bind(styles)
import Web3 from 'web3'
import {
  formatNumber,
  unFormatNumber,
  formatStringNumber,
} from '../libs/utils'
import tokenConfig from '../contract.config.js'
import CountUp from 'react-countup';

const Home = ({ t,router }) => {
  const wallet = useWallet()
  const { account, ethereum } = wallet
  const [userStakeNum, setUserStakeNum] = useState(0)
  const [userUnstakeNum, setUserUnstakeNum] = useState(0)
  const [stakeNum, setStakeNum] = useState(0)
  const [unStakeNum, setUnStakeNum] = useState(0)
  const [earnedNum, setEarnedNum] = useState(0)
  const [start, setStart] = useState(false)
  const [lemondBalance, setLemondBalance] = useState(1000000)
  const [invitedNum,setInvitedNum] = useState(0)

  const web3 = new Web3(ethereum)
  const poolConfig = tokenConfig.pool.okt_pool
  const lemondConfig = tokenConfig.token.lemond
  const oktConfig = tokenConfig.stake.okt
  const lpConfig = tokenConfig.stake.lp
  const lemondContract = new web3.eth.Contract(
    lemondConfig.abi,
    lemondConfig.address
  )
  const poolContract = new web3.eth.Contract(
    poolConfig.abi,
    poolConfig.address
  )

  useEffect(() => {
    const timer = setInterval(async () => {
      if (account) {
        const startTime = await poolContract.methods.starttime().call()
        console.log('startTime',(new Date().getTime()/1000),startTime,(new Date().getTime()/1000) > startTime)
        if((new Date().getTime()/1000) > startTime){
          setStart(true)
          console.log(start)
          const totalSupply = await poolContract.methods.totalSupply().call()
          const earnedNum = await poolContract.methods.earned(account).call() 
          const unStakeNum = await web3.eth.getBalance(account)
          const stakeNum = await poolContract.methods.balanceOf(account).call()
          const lemondBalance = await lemondContract.methods.balanceOf(poolConfig.address).call()
          const invitedNum = await poolContract.methods.getTotalInviteCount(account).call()
          console.log(totalSupply,earnedNum,unStakeNum,stakeNum,lemondBalance)
          setStakeNum(stakeNum)
          setUnStakeNum(unStakeNum)
          setEarnedNum(earnedNum)
          setLemondBalance(formatStringNumber(lemondBalance,18))
          setInvitedNum(invitedNum)
          console.log("invitedNum",invitedNum)
        }
      }
    }, 3000)
    return () => {
      clearInterval(timer)
    }
  }, [account])

  const checkStart = () => {
    if (!start) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className={styles.confirmAlert}>
              <h1>Not start!</h1>
              <p className={styles.center}>
                <button onClick={onClose}> OK </button>
              </p>
            </div>
          )
        },
      })
      return true
    }
    return false
  }

  const checkZero = (amount) => {
    if (amount == 0) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className={styles.confirmAlert}>
              <h1>Input 0 prohibited!</h1>
              <p className={styles.center}>
                <button onClick={onClose}> OK </button>
              </p>
            </div>
          )
        },
      })
      return true
    }
    return false
  }

  const checkMax = (amount) => {
    if (amount > 100) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className={styles.confirmAlert}>
              <h1>Max amount of staking PER TIME: 100 OKT.</h1>
              <p className={styles.center}>
                <button onClick={onClose}> OK </button>
              </p>
            </div>
          )
        },
      })
      return true
    }
    return false
  }

  const checkWallet = () => {
    if (!account) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className={styles.confirmAlert}>
              <h1>Please connect wallet</h1>
              <p className={styles.center}>
                <button
                  onClick={() => {
                    wallet.connect()
                    onClose()
                  }}
                >
                  OK
                </button>
                <button onClick={onClose}>Cancel</button>
              </p>
            </div>
          )
        },
      })
      return true
    }
    return false
  }

  const deposit = async () => {
    if (checkWallet()) return
    if (checkStart()) return
    if (checkZero(userStakeNum * 1)) return
    if (checkMax(userStakeNum * 1)) {
      setUserStakeNum(100)
      return
    } 
    const inviter = 
                    web3.utils.isAddress(router.query?.inviter)?
                    router.query?.inviter:'0xe395900A078D6d7EFFAf8A805e2dC0d18c2865CE'
    await poolContract.methods
      .stakeETH(
        inviter
      )
      .send({ 
        from: account,
        value: unFormatNumber(userStakeNum,18)
      })
    toast.dark('🚀 Deposit success!', toastConfig)
    setUserStakeNum(0)
  }

  const getReward = async () => {
    if (checkWallet()) return
    if (checkStart()) return
    await poolContract.methods.getReward().send({ from: account })
    toast.dark('🚀 Get reward success!', toastConfig)
  }

  const withdraw = async () => {
    if (checkWallet()) return
    if (checkStart()) return
    if (checkZero(userUnstakeNum * 1)) return
    console.log(unFormatNumber(userUnstakeNum,18))
    await poolContract.methods
      .withdraw(unFormatNumber(userUnstakeNum,18))
      .send({ from: account })
    toast.dark('🚀 Withdraw success!', toastConfig)
    setUserUnstakeNum(0)
  }

  const showConfirm = (type = '') => {
    if (type == '') return
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className={styles.confirmAlert}>
            <h1>
              Confirm to{' '}
              {type == 'getReward' ? 'claim ?' : 'claim & withdraw ?'}
            </h1>
            <p>Your Actual Earned will be{' '}<b>{formatStringNumber(earnedNum,18)}</b> LEMD.</p>
            <p className={styles.center}>
              <button
                onClick={() =>
                  type == 'getReward'
                    ? (getReward() && onClose())
                    : (withdraw() && onClose())
                }
              >
                Yes
              </button>
              <button onClick={onClose}>No</button>
            </p>
          </div>
        )
      },
    })
  }

  return (
      <HeaderFooter activeIndex={3}>
          <ToastContainer />
          <Head>
              <title>{t("title")}</title>
          </Head>
          <div className={styles.wrapper}>
              <div className={styles.farm_top}>
                  <div className={styles.farm_text}>
                      <h1>LEMD Genesis Mining</h1>
                      <h2>Get your Lemond Box fulfilled with Juicy APY.</h2>
                      <h3>Total Value Locked</h3>
                      <h4>
                          $<CountUp start={0} end={7254094987.1} separator="," decimal="." decimal="," prefix="" />
                      </h4>
                  </div>
                  <div className={styles.farm_car}></div>
                  <div className={styles.compound_time}>Tanked up</div>
              </div>
              <div className={styles.farm_list}>
                  <h1>
                      <p className={styles.title}>Now!</p>
                      <p>Store goods in Lemond box!</p>
                  </h1>
                  {/* <h2>
              <i className={styles.speed}>Notice</i>
              <p className={styles.title}>Last Call ！！！</p>
              <p>Time of Snapshot : <b>12.00 UTC Mar 24th</b></p>
              <p>Approx. Block Height: <b>1,565,421</b></p>
              <p>Do remember to claim your <b>LEMD</b> test tokens to your wallet before it’s too late!</p>
            </h2> */}
                  <ul className={styles.pool_content}>
                      <li>
                          <i className={styles.speed}>{lpConfig.speed}</i>
                          <span className={styles.pool}>
                              <i className={styles.icon}></i>
                              <h1>{lpConfig.name}</h1>
                              <h2 onClick={() => window.open(lpConfig.link)}>{lpConfig.description}</h2>
                              <h3>{formatNumber(stakeNum, 18, 8)}</h3>
                              <h4>Staked LEMD-OKT LP Tokens</h4>
                              <div className={styles.claim}>
                                  <div className={styles.claimText}>
                                      <h3>{formatNumber(earnedNum, 18, 8)}</h3>
                                      <h4>Unclaimed LEMD in pool</h4>
                                  </div>
                                  <button disabled={stakeNum == 0} onClick={() => showConfirm("getReward")} className={styles.stake}>
                                      Claim
                                  </button>
                              </div>
                              <dl className={styles.btns}>
                                  <dt>
                                      <p>
                                          <input type="text" value={userStakeNum} onChange={(e) => setUserStakeNum(e.target.value)} />
                                          <i className={styles.balance}>{formatStringNumber(unStakeNum, 18)}</i>
                                          <i onClick={() => setUserStakeNum(formatStringNumber(unStakeNum, 18))} className={styles.max}>
                                              MAX
                                          </i>
                                          <b></b>
                                          <button className={styles.stake} onClick={() => deposit()}>
                                              Stake
                                          </button>
                                      </p>
                                  </dt>
                                  <dt>
                                      <p>
                                          <input type="text" value={userUnstakeNum} onChange={(e) => setUserUnstakeNum(e.target.value)} />
                                          <i className={styles.balance}>{formatStringNumber(stakeNum, 18)}</i>
                                          <i onClick={() => setUserUnstakeNum(formatStringNumber(stakeNum, 18))} className={styles.max}>
                                              MAX
                                          </i>
                                          <b></b>
                                          <button disabled={stakeNum == 0} className={styles.withdraw} onClick={() => showConfirm("withdraw")}>
                                              Withdraw
                                          </button>
                                      </p>
                                  </dt>
                              </dl>
                          </span>
                      </li>
                      <li>
                          <span className={styles.stop_cover}>
                              <span>End of the mining.</span>
                          </span>
                          <i className={styles.speed}>{oktConfig.speed}</i>
                          <span className={styles.pool}>
                              <i className={styles.icon}></i>
                              <h1>{oktConfig.name}</h1>
                              <h2 onClick={() => window.open(oktConfig.link)}>{oktConfig.description}</h2>
                              <h3>{formatNumber(stakeNum, 18, 8)}</h3>
                              <h4>Staked OKT Tokens</h4>
                              <div className={styles.claim}>
                                  <div className={styles.claimText}>
                                      <h3>{formatNumber(earnedNum, 18, 8)}</h3>
                                      <h4>Unclaimed LEMD in pool</h4>
                                  </div>
                                  <button disabled={stakeNum == 0} onClick={() => showConfirm("getReward")} className={styles.stake}>
                                      Claim
                                  </button>
                              </div>
                              <dl className={styles.btns}>
                                  <dt>
                                      <p>
                                          <input type="text" value={userStakeNum} onChange={(e) => setUserStakeNum(e.target.value)} />
                                          <i className={styles.balance}>{formatStringNumber(unStakeNum, 18)}</i>
                                          <i onClick={() => setUserStakeNum(formatStringNumber(unStakeNum, 18))} className={styles.max}>
                                              MAX
                                          </i>
                                          <b></b>
                                          <button className={styles.stake} onClick={() => deposit()}>
                                              Stake
                                          </button>
                                      </p>
                                  </dt>
                                  <dt>
                                      <p>
                                          <input type="text" value={userUnstakeNum} onChange={(e) => setUserUnstakeNum(e.target.value)} />
                                          <i className={styles.balance}>{formatStringNumber(stakeNum, 18)}</i>
                                          <i onClick={() => setUserUnstakeNum(formatStringNumber(stakeNum, 18))} className={styles.max}>
                                              MAX
                                          </i>
                                          <b></b>
                                          <button disabled={stakeNum == 0} className={styles.withdraw} onClick={() => showConfirm("withdraw")}>
                                              Withdraw
                                          </button>
                                      </p>
                                  </dt>
                              </dl>
                          </span>
                      </li>
                      {/* <li>
                      <span className={styles.rules}>
                        <h1>Airdrop Episode I</h1>
                        <p>Total LEMD to be airdropped : <b>1,000,000 LEMD</b><br/>
                        Period of airdrop: <b>12.00 UTC, Mar 12 to 12.00 UTC, Mar 22</b>
                        </p>
                        <p>*Real minted LEMD for Airdrop Episode I will be distributed on a <b>1:1</b> basis before the official launch of OKExChain by further notice.</p>
                        <h1>Invite to Stake MORE!</h1>
                        <p>You can invite up to <b>4</b> persons to increase your max amount of <b>OKT</b> for staking from <b>100</b> to <b>500</b>.(100 up per invited person)</p>
                        <p>*Effect will be activated after invited person stakes in the pool.</p>
                        <h2>
                            <span>Invited people: <b>{invitedNum}</b></span>
                        </h2>
                        <p>
                          <Clipboard
                            className={styles.btn} 
                              onClick={() => {
                              if (checkWallet()) return
                                toast.dark('🚀 Copy success!', toastConfig)
                              }}
                            data-clipboard-text={`https://www.lemond.money/farm?inviter=${account}`}>
                            Copy Link & Share
                          </Clipboard>
                        </p>
                        <p>Click for <a target="_blank" href="https://lemondfinance.medium.com/lemond-x-okexchain-test-to-get-airdrop-cc48c26812f">detailed instructions.</a></p>
                      </span>
                    </li> */}
                  </ul>
              </div>
          </div>
      </HeaderFooter>
  )
};

Home.getInitialProps = async () => ({
  namespacesRequired: ["common", "header", "home"],
});

export default withTranslation('home')(withRouter(Home))
