import Head from "next/head"
import { useEffect, useState } from "react"
import useWallet from "use-wallet"
import { Link, withTranslation } from "../i18n"
import HeaderFooter from "../layout/HeaderFooter"
import classNames from "classnames/bind"
import styles from "../styles/lend.less"
import { confirmAlert } from "react-confirm-alert"
import { ToastContainer, toast } from "react-toastify"
import { toastConfig } from "../libs/utils"
import tokenConfig from "../contract.config.js"
const cx = classNames.bind(styles)
import Web3 from "web3"

const Home = ({ t }) => {
    const { account, ethereum } = useWallet()
    const [showLendBox, setShowLendBox] = useState(false)

    const web3 = new Web3(ethereum)
    const poolConfig = tokenConfig.pool.okt_pool

    const showDialog = () => {
        confirmAlert({
            title: "Confirm to submit",
            message: "Are you sure to do this.",
            buttons: [
                {
                    label: "Yes",
                    onClick: () => alert("Click Yes"),
                },
                {
                    label: "No",
                    onClick: () => alert("Click No"),
                },
            ],
        })
    }

    const showAlert = () => {
        toast.dark("🚀 Waiting for open!", toastConfig)
    }

    return (
        <HeaderFooter activeIndex={2}>
            <ToastContainer />
            <Head>
                <title>{t("title")}</title>
            </Head>
            <div className={styles.wrapper}>
                <div className={styles.lend_total}>
                    <h1>
                        <i className={styles.light}></i>
                        <span className={styles.box_front}></span>
                        <span className={styles.text}>
                            <h2>Net APY</h2>
                            <p>0.00%</p>
                        </span>
                        <i className={styles.lemond1}></i>
                        <i className={styles.lemond2}></i>
                        <i className={styles.lemond3}></i>
                        <i className={styles.lemond4}></i>
                        <i className={styles.lemond5}></i>
                    </h1>
                    <div className={styles.supplyText}>
                        <h3>Supply Balance</h3>
                        <p>$ 0.000000</p>
                    </div>
                    <div className={styles.borrowText}>
                        <h3>Borrow Balance</h3>
                        <p>$ 0.000000</p>
                    </div>
                    <div className={styles.lend_line}>
                        <div className={styles.line}>
                            <i className={styles.inner}>
                                <span className={styles.line_light}></span>
                                <i />
                            </i>
                        </div>
                        <span className={styles.text}>Borrow Limit</span>
                        <span className={styles.num}>0.000000 %</span>
                    </div>
                </div>
                <ul className={styles.lend_list}>
                    <li className={styles.okb}>
                        <span className={styles.icon}></span>
                        <span className={styles.left}>
                            <p>#OKB</p>
                            <p className={styles.sub_title}>OKB</p>
                        </span>
                        <span>
                            <p>$0M</p>
                            <p className={styles.sub_titles}>Market size</p>
                        </span>
                        <span>
                            <p>$0M</p>
                            <p className={styles.sub_titles}>Total borrowed</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>Deposit APY</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>Borrow APY</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>
                                Distribution APY
                            </p>
                        </span>
                        <span className={styles.none}>
                            <button
                                onClick={() => showAlert()}
                                // onClick={() => setShowLendBox(true)}
                            >
                                Deposit / Borrow
                            </button>
                        </span>
                    </li>
                    <li className={styles.usdt}>
                        <span className={styles.icon}></span>
                        <span className={styles.left}>
                            <p>#Tether</p>
                            <p className={styles.sub_title}>USTD</p>
                        </span>
                        <span>
                            <p>$0M</p>
                            <p className={styles.sub_titles}>Market size</p>
                        </span>
                        <span>
                            <p>$0M</p>
                            <p className={styles.sub_titles}>Total borrowed</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>Deposit APY</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>Borrow APY</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>
                                Distribution APY
                            </p>
                        </span>
                        <span className={styles.none}>
                            <button onClick={() => showAlert()}>
                                Deposit / Borrow
                            </button>
                        </span>
                    </li>
                    <li className={styles.btc}>
                        <span className={styles.icon}></span>
                        <span className={styles.left}>
                            <p>#BitCoin</p>
                            <p className={styles.sub_title}>BTC</p>
                        </span>
                        <span>
                            <p>$0M</p>
                            <p className={styles.sub_titles}>Market size</p>
                        </span>
                        <span>
                            <p>$0M</p>
                            <p className={styles.sub_titles}>Total borrowed</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>Deposit APY</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>Borrow APY</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>
                                Distribution APY
                            </p>
                        </span>
                        <span className={styles.none}>
                            <button onClick={() => showAlert()}>
                                Deposit / Borrow
                            </button>
                        </span>
                    </li>
                    <li className={styles.eth}>
                        <span className={styles.icon}></span>
                        <span className={styles.left}>
                            <p>#Ethereum</p>
                            <p className={styles.sub_title}>ETH</p>
                        </span>
                        <span>
                            <p>$0M</p>
                            <p className={styles.sub_titles}>Market size</p>
                        </span>
                        <span>
                            <p>$0M</p>
                            <p className={styles.sub_titles}>Total borrowed</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>Deposit APY</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>Borrow APY</p>
                        </span>
                        <span>
                            <p>0%</p>
                            <p className={styles.sub_titles}>
                                Distribution APY
                            </p>
                        </span>
                        <span className={styles.none}>
                            <button onClick={() => showAlert()}>
                                Deposit / Borrow
                            </button>
                        </span>
                    </li>
                </ul>
                <div
                    className={cx(styles.mask, { hide: !showLendBox })}
                    onClick={() => {
                        setShowLendBox(false)
                    }}
                >
                    <div
                        className={cx(
                            styles.lend_box,
                            styles.approve,
                            styles.usdt,
                        )}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                    >
                        <div className={styles.title}>
                            <i className={styles.icon_usdt}></i>
                            <span className={styles.text}>
                                <h1>#Tether</h1>
                                <p>USTD</p>
                            </span>
                            <span className={styles.apy}>
                                <h1>65.86%</h1>
                                <p>Total APY</p>
                            </span>
                        </div>
                        <ul className={styles.tabs}>
                            <li className={styles.active}>SUPPLY</li>
                            <li>WITHDRAW</li>
                        </ul>
                        <div className={cx(styles.content, styles.none)}>
                            <div className={styles.info}>
                                <h1>Supply Rates</h1>
                                <ul>
                                    <li>
                                        <p>
                                            <span>Supply APY</span>
                                            <span className={styles.num}>
                                                65.86%
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Distribution APY</span>
                                            <span className={styles.num}>
                                                35.86%
                                            </span>
                                        </p>
                                    </li>
                                </ul>
                            </div>
                            <div className={styles.tools}>
                                <span className={styles.balance}>
                                    <h1>0 USDT</h1>
                                    <p>Wallet Balance</p>
                                </span>
                                <span className={styles.btns}>
                                    <button className={styles.none}>
                                        Close
                                    </button>
                                    <button className={styles.green}>
                                        ENABLE
                                    </button>
                                </span>
                            </div>
                        </div>
                        <div className={cx(styles.content, styles.a)}>
                            <div className={styles.inputAction}>
                                <h1>Supply Rates</h1>
                                <input type="text" placeholder="0" />
                                <button>SAFE MAX</button>
                            </div>
                            <div className={styles.info}>
                                <h1>Supply Rates</h1>
                                <ul>
                                    <li>
                                        <p>
                                            <span>Supply APY</span>
                                            <span className={styles.num}>
                                                65.86%
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Distribution APY</span>
                                            <span className={styles.num}>
                                                35.86%
                                            </span>
                                        </p>
                                    </li>
                                </ul>
                            </div>
                            <div className={styles.info}>
                                <h1>Supply Rates</h1>
                                <ul>
                                    <li>
                                        <p>
                                            <span>Supply APY</span>
                                            <span className={styles.num}>
                                                65.86%
                                            </span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Distribution APY</span>
                                            <span className={styles.num}>
                                                35.86%
                                            </span>
                                        </p>
                                        <p className={styles.bar}>
                                            <span
                                                className={styles.inner}
                                            ></span>
                                        </p>
                                    </li>
                                </ul>
                            </div>
                            <div className={styles.tools}>
                                <span className={styles.balance}>
                                    <h1>0 USDT</h1>
                                    <p>Wallet Balance</p>
                                </span>
                                <span className={styles.btns}>
                                    <button className={styles.none}>
                                        Close
                                    </button>
                                    <button disabled className={styles.green}>
                                        NO BALANCE TO WITHDRAW
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HeaderFooter>
    )
}

Home.getInitialProps = async () => ({
    namespacesRequired: ["common", "header", "home"],
})

export default withTranslation("home")(Home)
