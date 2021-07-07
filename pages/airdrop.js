import Head from "next/head"
import useWallet from "use-wallet"
import { Link, withTranslation } from "../i18n"
import React, { useState, useEffect } from "react"
import HeaderFooter from "../layout/HeaderFooter"
import classNames from "classnames/bind"
import styles from "../styles/airdrop.less"
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
import axios from 'axios';

const Home = ({ t,router }) => {
  const wallet = useWallet()
  const { account, ethereum } = wallet
  const [activeTelegram, setActiveTelegram] = useState(false)
  const [activeTwitter, setActiveTwitter] = useState(false)
  const [activeSubmit, setActiveSubmit] = useState(false)
  const [luckyNumber, setLuckyNumber] = useState(0)
  const [prize, setPrize] = useState(0)
  const [totalTicket, setTotalTicket] = useState(0)
  
  const { bsc } = tokenConfig.airdrop
  const web3 = new Web3(ethereum)
  const airdropContract = new web3.eth.Contract(bsc.abi, bsc.address)

  useEffect(() => {
    const timer = setInterval(async () => {
      if (account) {
          const ticketID = await airdropContract.methods.ticketIDs(account).call()
          console.log("ticketID", ticketID)
          setLuckyNumber(ticketID)
          const prize = await airdropContract.methods.amounts(account).call()
          setPrize(prize)
          console.log("prize", prize)
          const totalTicketID = await airdropContract.methods.getTotalNumberTicketID().call()
          setTotalTicket(totalTicketID)
          const ticket = await airdropContract.methods.tickets(162).call()
          console.log(ticket)
      }
    }, 3000)
    return () => {
      clearInterval(timer)
    }
  }, [account])

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

  const showWarning = () => {

          confirmAlert({
              customUI: ({ onClose }) => {
                  return (
                      <div className={styles.confirmAlert}>
                          <h1>Please finish the previous step first.</h1>
                          <p className={styles.center}>
                              <button
                                  onClick={() => {
                                      onClose()
                                  }}
                              >
                                  OK
                              </button>
                          </p>
                      </div>
                  )
              },
          })
  }

  const showNotStart = () => {
      confirmAlert({
          customUI: ({ onClose }) => {
              return (
                  <div className={styles.confirmAlert}>
                      <h1>Not Start</h1>
                      <p className={styles.center}>
                          <button
                              onClick={() => {
                                  onClose()
                              }}
                          >
                              OK
                          </button>
                      </p>
                  </div>
              )
          },
      })
  }

  const onSubmit = async (e, onClose) => {
      if(luckyNumber == 0){
          let result = await axios.get(
              "/api/airdrop?address=" +
                  account +
                  "&telegram=" +
                  e.target.getElementsByTagName("input")[0].value +
                  "&twitter=" +
                  e.target.getElementsByTagName("input")[1].value +
                  "&tweet=" +
                  e.target.getElementsByTagName("input")[2].value,
          )
          console.log(result)
          const { data } = result
          if (data.success) {
              onClose()
              toast.dark("🚀 Submit success!", toastConfig)
              await airdropContract.methods.getAirdrop().send({ from: account })
          } else {
              onClose()
              toast.dark("🚀 Submit fail!", toastConfig)
          }
      }else{
          onClose()
          toast.dark("🚀 Submit fail!", toastConfig)
      }

      
  }

  const showAirdropForm = () => {
      if (checkWallet()) return
      confirmAlert({
          customUI: ({ onClose }) => {
              return (
                  <div className={styles.confirmAlert}>
                      <h1>Airdrop Form</h1>
                      <p>🎁 Get airdrop.</p>
                      <form
                          onSubmit={(e) => {
                              e.preventDefault()
                              onSubmit(e, onClose)
                          }}
                      >
                          <dt>
                              <dl>
                                  <label>Telegram:</label>
                                  <input
                                      pattern="^@\w+$"
                                      title="Please enter username, not nickname (e.g @Steven)"
                                      name="telegram"
                                      type="text"
                                      placeholder="Enter your telegram username (with@)"
                                      required
                                  />
                              </dl>
                              <dl>
                                  <label>Twitter:</label>
                                  <input
                                      pattern="^@\w+$"
                                      title="Please enter username, not nickname (e.g @Steven)"
                                      name="twitter"
                                      type="text"
                                      placeholder="Enter your twitter username (with@)"
                                      required
                                  />
                              </dl>
                              <dl>
                                  <label>Tweet link:</label>
                                  <input
                                      name="tweet"
                                      type="text"
                                      placeholder="Enter your tweet link（start with https://)"
                                      required
                                  />
                              </dl>
                          </dt>
                          <p className={styles.center}>
                              <button type="submit">Submit</button>
                              <button onClick={onClose}>Cancel</button>
                          </p>
                      </form>
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
              <div className={styles.bg}>
                  <h1>Current number of participants: 10000</h1>
              </div>
              {luckyNumber != 0 ? (
                  <div className={styles.tickets}>
                      <h1>Congratulations! </h1>
                      <h1>You have been awarded {formatNumber(prize, 18, 2)} lemd</h1>
                      <p>Please keep the lucky draw code on your right 👉</p>
                      <i>
                          Lucky Number: <br />
                          {luckyNumber}
                      </i>
                  </div>
              ) : (
                  <ul className={styles.steps}>
                      <li className={cx({ active: !!account })}>
                          <i></i>
                          <p>Connect</p>
                          <p>Your wallet</p>
                          <p>
                              <button
                                  onClick={() => {
                                      if (!account) {
                                          checkWallet()
                                      }
                                  }}
                              >
                                  {!account ? "Connect" : "Connected"}
                              </button>
                          </p>
                      </li>
                      <li className={cx({ active: activeTelegram })}>
                          <i></i>
                          <p>Join Our </p>
                          <p>Telegroup Group</p>
                          <p>
                              <button
                                  onClick={() => {
                                      if (account) {
                                          window.open("https://t.me/lemondok")
                                          setActiveTelegram(true)
                                      } else {
                                          showWarning()
                                      }
                                  }}
                              >
                                  Go to Telegram
                              </button>
                          </p>
                      </li>
                      <li className={cx({ active: activeTwitter })}>
                          <i></i>
                          <p>Follow</p>
                          <p>Our Twitter</p>
                          <p>
                              <button
                                  onClick={() => {
                                      if (activeTelegram) {
                                          window.open("https://twitter.com/LemondFinance")
                                          setActiveTwitter(true)
                                      } else {
                                          showWarning()
                                      }
                                  }}
                              >
                                  @LemondFinance
                              </button>
                          </p>
                      </li>
                      <li className={cx({ active: activeSubmit })}>
                          <i></i>
                          <p>Compose</p>
                          <p>a Tweet</p>
                          <p>
                              <button
                                  onClick={() => {
                                      if (activeTwitter) {
                                          window.open("https://twitter.com/intent/tweet?text=Lemond%20on%20Binance!%20%23LemondFinance%20$LEMD%20@LemondFinance%20@BinanceChain%20%23LemondonBinance")
                                          setActiveSubmit(true)
                                      } else {
                                          showWarning()
                                      }
                                  }}
                              >
                                  Post
                              </button>
                          </p>
                      </li>
                      <li>
                          <i></i>
                          <p>Airdrop</p>
                          <p>Application</p>
                          <p>
                              <button
                                  onClick={() => {
                                      if (activeSubmit) {
                                          showAirdropForm()
                                      } else {
                                          showWarning()
                                      }
                                  }}
                              >
                                  Submit
                              </button>
                          </p>
                      </li>
                  </ul>
              )}
              <div className={styles.rules}>
                  <p>1. Maxium number of participants : 100,000. First Come, First Served. </p>
                  <p>2. Each participant who has completed all tasks and submitted information will receive a random reward of 1-10 lemd and a submission number.</p>
                  <p>
                      3. After the activity, the system will use the random algorithm in Ethereum virtual machine to extract the bond user list on the chain according to the user's submission number.{" "}
                  </p>
                  <p>4. Same Telegram or Twitter account could only apply once.</p>
                  <p>5. Tweet must be visible to all.</p>
                  <p>6. Any unqualified action would be treated as invalid.</p>
                  <p>7. Withdrawal of LEMD would be available after official deployment to Binance Smart Chain. Accurate time to be announced.</p>
                  <p className={styles.hight_light}>
                      The whole lottery process is open source on the chain. Open source address:
                      <b>0xe287982d82b2b6d27dB3a41BD7179DeF69503106</b>
                  </p>
              </div>
              <div className={styles.prize}>
                  <div className={styles.left}>
                      <ul>
                          <li>
                              <img src="/img/prize_orange.svg" />
                              <span className={styles.title}>
                                  <h1>Orange</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>20</h1>
                                  <p>lemd</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_apple.svg" />
                              <span className={styles.title}>
                                  <h1>Apple</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>50</h1>
                                  <p>lemon bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>200</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_banana.svg" />
                              <span className={styles.title}>
                                  <h1>Banana</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>100</h1>
                                  <p>lemon bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>100</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_pineapple.svg" />
                              <span className={styles.title}>
                                  <h1>Pineapple</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>lemon bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>10</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_melon.svg" />
                              <span className={styles.title}>
                                  <h1>Melon</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>1,000</h1>
                                  <p>lemon bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>5</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_lemon.svg" />
                              <span className={styles.title}>
                                  <h1>Lemond</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>10,000</h1>
                                  <p>lemon bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>1</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                      </ul>
                  </div>
                  <div className={styles.right}>
                      <div className={styles.ticket}>
                          <h1>My LEMD Balance</h1>
                          <h2>{formatNumber(prize, 18, 2)}</h2>
                          <p>LEMD</p>
                          <button
                              onClick={async () => {
                                  showNotStart()
                                  //   await airdropContract.methods.getPrize().send({ from: account })
                              }}
                          >
                              Claim
                          </button>
                      </div>
                      <div className={styles.winner}>
                          <h1>List of winners</h1>
                          <ul>
                              <li>
                                  <span>Coming soon</span>
                                  <span></span>
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      </HeaderFooter>
  )
};

Home.getInitialProps = async () => ({
  namespacesRequired: ["common", "header", "home"],
});

export default withTranslation('home')(withRouter(Home))
