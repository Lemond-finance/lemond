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

const Home = ({ t,router }) => {
  const wallet = useWallet()
  const { account, ethereum } = wallet

  useEffect(() => {
    const timer = setInterval(async () => {
      if (account) {
      }
    }, 3000)
    return () => {
      clearInterval(timer)
    }
  }, [account])

  return (
      <HeaderFooter activeIndex={3}>
          <ToastContainer />
          <Head>
              <title>{t("title")}</title>
          </Head>
          <div className={styles.wrapper}>
              <div className={styles.bg}></div>
              <ul className={styles.steps}>
                  <li className={styles.active}>
                      <i></i>
                      <p>Connect</p>
                      <p>Your wallet</p>
                      <p>
                          <button>Connect</button>
                      </p>
                  </li>
                  <li className={styles.active}>
                      <i></i>
                      <p>Go to Telegram</p>
                      <p>Join Group.</p>
                      <p>
                          <button>Go to Telegram</button>
                      </p>
                  </li>
                  <li className={styles.active}>
                      <i></i>
                      <p>Connect</p>
                      <p>Your wallet</p>
                      <p>
                          <button>Connect</button>
                      </p>
                  </li>
                  <li className={styles.active}>
                      <i></i>
                      <p>Connect</p>
                      <p>Your wallet</p>
                      <p>
                          <button>Connect</button>
                      </p>
                  </li>
              </ul>
              <div className={styles.rules}>
                  <p>1. Each participant who has completed all tasks and submitted information will receive a random reward of 1-10 lemd and a submission number.</p>
                  <p>
                      2. After the activity, the system will use the random algorithm in Ethereum virtual machine to extract the bond user list on the chain according to the user's submission number.
                  </p>
                  <p className={styles.hight_light}>
                      The whole lottery process is open source on the chain. Open source address:
                      <b>0x00a0ad21321j321v312c3</b>
                  </p>
              </div>
              <div className={styles.prize}>
                  <div className={styles.left}>
                      <ul>
                          <li>
                              <img src="/img/prize_lemon.svg" />
                              <span className={styles.title}>
                                  <h1>Orange</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>lemd</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_melon.svg" />
                              <span className={styles.title}>
                                  <h1>Orange</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>lemd</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_pineapple.svg" />
                              <span className={styles.title}>
                                  <h1>Orange</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>lemd</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_banana.svg" />
                              <span className={styles.title}>
                                  <h1>Orange</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
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
                                  <h1>Orange</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>lemd</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                          <li>
                              <img src="/img/prize_orange.svg" />
                              <span className={styles.title}>
                                  <h1>Orange</h1>
                                  <p>bonus</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>lemd</p>
                              </span>
                              <span className={styles.num}>
                                  <h1>500</h1>
                                  <p>copies</p>
                              </span>
                          </li>
                      </ul>
                  </div>
                  <div className={styles.right}>
                      <div className={styles.ticket}>
                          <h1>Lemond Airdrop Limit</h1>
                          <h2>2000</h2>
                          <p>LEMD</p>
                      </div>
                      <div className={styles.winner}>
                          <h1>List of winners</h1>
                          <ul>
                              <li>
                                  <span>0x00a0ad21321j321v312c3</span>
                                  <span>34234</span>
                              </li>
                              <li>
                                  <span>0x00a0ad21321j321v312c3</span>
                                  <span>34234</span>
                              </li>
                              <li>
                                  <span>0x00a0ad21321j321v312c3</span>
                                  <span>34234</span>
                              </li>
                              <li>
                                  <span>0x00a0ad21321j321v312c3</span>
                                  <span>34234</span>
                              </li>
                              <li>
                                  <span>0x00a0ad21321j321v312c3</span>
                                  <span>34234</span>
                              </li>
                              <li>
                                  <span>0x00a0ad21321j321v312c3</span>
                                  <span>34234</span>
                              </li>
                              <li>
                                  <span>0x00a0ad21321j321v312c3</span>
                                  <span>34234</span>
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
