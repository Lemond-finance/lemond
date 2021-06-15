import Head from "next/head"
import useWallet from "use-wallet"
import { Link, withTranslation } from "../i18n"
import React, { useState, useEffect } from "react"
import HeaderFooter from "../layout/HeaderFooter"
import classNames from "classnames/bind"
import styles from "../styles/across_chain.less"
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
      <HeaderFooter activeIndex={4}>
          <ToastContainer />
          <Head>
              <title>{t("title")}</title>
          </Head>
          <div className={styles.wrapper}>
              <div className={styles.across_chain}>
                  <div className={styles.content}>
                      <h1>Enable your LEMD to flow between chains.</h1>
                      <div className={styles.swap}>
                          {/* <div className={styles.cover}>
                              Coming Soon.
                          </div> */}
                          <h2>Current participating users</h2>
                          <div className={styles.box}>
                              <i className={styles.icon_swap}></i>
                              <ul>
                                  <li>
                                      <img src="/img/icon_btc.svg" />
                                      <input defaultValue="0" />
                                  </li>
                                  <li>
                                      <img src="/img/icon_eth.svg" />
                                      <input defaultValue="0" />
                                  </li>
                              </ul>
                          </div>
                          <div className={styles.balance}>
                              <div className={styles.balance_content}>
                                  <span className={styles.num}>0.00</span>
                                  <span>Wallet balance</span>
                              </div>
                              <button disabled>Coming Soon</button>
                          </div>
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
