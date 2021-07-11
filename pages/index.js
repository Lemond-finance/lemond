import Head from "next/head";
import React, { useState, useEffect } from "react";
import { render } from 'react-dom';
import useWallet from "use-wallet";
import { Link, withTranslation } from "../i18n";
import HeaderFooter from "../layout/HeaderFooter";
import classNames from "classnames/bind";
import styles from "../styles/home.less";
import CountUp from 'react-countup';
import axios from 'axios';
import { getLendInfo, getTotalValueLocked } from "../api/api"
import ReactTypingEffect from "react-typing-effect"
const cx = classNames.bind(styles);

const Home = ({ t }) => {
  const [totalValueLocked, setTotalValueLocked] = useState(0)

  useEffect(async () => {
      //   const { data } = await getTotalValueLocked()
      //   setTotalValueLocked(data.data)
  }, [])

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
                      <CountUp start={0} end={totalValueLocked} separator="," decimal="." decimal="," prefix="$" />
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
              <div className={styles.multiple_chain}>
                  <h1>Lemond Protocol</h1>
                  <h2>
                      Money Markets built on
                      <br />
                      <b>
                          <ReactTypingEffect typingDelay={300} eraseSpeed={0} text={["Ethereum", "Binance Smart Chain", "OKExChain"]} />
                      </b>
                  </h2>
                  <p>Multiple loan choices on multiple chains with easy access and juicy liquidity.</p>
              </div>
              <div className={styles.feature}>
                  <ul>
                      <li className={styles.cross_chain}>
                          <h1>
                              <img src="/img/cross_chain_title.png" height="35" />
                          </h1>
                          <h2>Cross chain</h2>
                          <p>Cross chain mortgage loan assets, supporting ETH, BSC, OKExChain main network.</p>
                      </li>
                      <li className={styles.dao}>
                          <h1>
                              <img src="/img/dao_title.png" height="35" />
                          </h1>
                          <h2>DAO</h2>
                          <p>Ltoken can be used to pledge liquidity, improve income and govern.</p>
                      </li>
                      <li className={styles.nft}>
                          <h1>
                              <img src="/img/nft_title.png" height="35" />
                          </h1>
                          <h2>NFT</h2>
                          <p>NFT pledge lending supports the function of erc721 asset lending.</p>
                      </li>
                      <li className={styles.aggregate}>
                          <h1>
                              <img src="/img/aggregate_title.png" height="35" />
                          </h1>
                          <h2>Aggregate Income</h2>
                          <p>
                              Simply Hodl LEMD to
                              <br />
                              Vote, Govern, and More.
                          </p>
                      </li>
                  </ul>
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
                      <Link href="/farm">
                          <button>Ended</button>
                      </Link>{" "}
                  </p>
                  <p className={styles.btns}>
                      Episode ②{" "}
                      <Link href="/lend">
                          <button>Ended</button>
                      </Link>
                  </p>
                  <p className={styles.btns}>
                      Episode ③{" "}
                      <Link href="/airdrop">
                          <button>Ended</button>
                      </Link>
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
