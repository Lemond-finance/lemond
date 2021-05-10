import Head from "next/head";
import React, { useState, useEffect } from "react";
import { render } from 'react-dom';
import useWallet from "use-wallet";
import { Link, withTranslation } from "../i18n";
import HeaderFooter from "../layout/HeaderFooter";
import classNames from "classnames/bind";
import styles from "../styles/home.less";
const cx = classNames.bind(styles);
import Web3 from 'web3';
import CountUp from 'react-countup';
 
const Home = ({ t }) => {

  return (
      <HeaderFooter activeIndex={1}>
          <Head>
              <title>{t("title")}</title>
          </Head>
          <div className={styles.wrapper}>
              <div className={styles.bg_cute}>
                  <div className={styles.bg_box}></div>
              </div>
              <div className={styles.slogan}>
                  <h1></h1>
                  <h2>
                      A <b>Juicy DeFi</b> Protocol
                  </h2>
                  <h4 id="count">
                      <CountUp start={0} end={5270319549.94} separator="," decimal="." decimal="," prefix="$" />
                  </h4>
                  <p>
                      <b>Lemond</b> is a decentralized, open-source, autonomous, non-custodial liquidity market protocol where users can participate as depositors or borrowers.
                  </p>
                  <p>
                      <Link href="/lend">
                          <button>Get App</button>
                      </Link>
                  </p>
              </div>
              <div className={styles.airdrop}>
                  <div className={styles.airdrop_box}></div>
                  <h1>
                      <i></i>
                      <span>Lemond AirDrop</span>
                  </h1>
                  <h2>Lemond Airdrop</h2>
                  <p>
                      Besides <b>OKExChain</b> testing bounty. <b>Lemond</b> is also holding Airdrop Carnival to get your bag served.
                  </p>
                  <p>
                      Massive <b>$LEMD</b> in the box!
                  </p>
                  <p>Suit up for our Juicy Candies.</p>
                  <p className={styles.btns}>
                      Episode ①{" "}
                      <Link href="/farm" disabled>
                          <button>Ended</button>
                      </Link>{" "}
                  </p>
                  <p className={styles.btns}>
                      Episode ②{" "}
                      <Link href="/lend">
                          <button>Get Airdrop >></button>
                      </Link>
                  </p>
                  <p className={styles.btns} >
                      Episode ③ <button disabled>Comming soon</button>{" "}
                  </p>
              </div>
              <div className={styles.partners}>
                  <h1>Road Map</h1>
                  <p className={styles.road_map}></p>
              </div>
              <div className={styles.partners}>
                  <h1>Partners</h1>
                  <ul>
                      <li className={styles.okexchain}></li>
                      <li className={styles.gate}></li>
                      <li className={styles.mxc}></li>
                      <li className={styles.zb}></li>
                      <li className={styles.hoo}></li>
                      <li className={styles.bkex}></li>
                      <li className={styles.coinshub}></li>
                      <li className={styles.bigone}></li>
                      <li className={styles.crypto_venture_capital}></li>
                      <li className={styles.roots_cap}></li>
                      <li className={styles.tokenpocket}></li>
                      <li className={styles.onto}></li>
                      <li className={styles.hyper}></li>
                      <li className={styles.bitkeep}></li>
                  </ul>
              </div>
          </div>
      </HeaderFooter>
  )
};

Home.getInitialProps = async () => ({
  namespacesRequired: ["common", "header", "home"],
});


export default withTranslation("home")(Home);
