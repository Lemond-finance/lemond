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
    const [remaining, setRemaining] = useState(0)

    const web3 = new Web3(ethereum)
    
    const { comptroller } = tokenConfig.lend.controller
    const comptrollerContract = new web3.eth.Contract(comptroller.abi, comptroller.address)
    const { OKB, USDT, ETHK, BTCK } = tokenConfig.lend.tokens
    const OKBContract = new web3.eth.Contract(OKB.abi, OKB.address)
    const USDTContract = new web3.eth.Contract(USDT.abi, USDT.address)
    const ETHKContract = new web3.eth.Contract(ETHK.abi, ETHK.address)
    const BTCKContract = new web3.eth.Contract(BTCK.abi, BTCK.address)
    const { lEther, lOKB, lUSDT, lETHK, lBTCK } = tokenConfig.lend.lTokens
    const lEtherContract = new web3.eth.Contract(lEther.abi, lEther.address)
    const lOKBContract = new web3.eth.Contract(lOKB.abi, lOKB.address)
    const lUSDTContract = new web3.eth.Contract(lUSDT.abi, lUSDT.address)
    const lETHKContract = new web3.eth.Contract(lETHK.abi, lETHK.address)
    const lBTCKContract = new web3.eth.Contract(lBTCK.abi, lBTCK.address)

    useEffect(() => {
        const timer = setInterval(async () => {
            if (account) {
                const remaining = await comptrollerContract.methods.getAccountLiquidity(account).call()
                setRemaining(remaining[1])
                const cash = await lEtherContract.methods.getCash().call()
                console.log("cash",cash)
                const exchangeRate = (await lEtherContract.methods.exchangeRateCurrent().call()) / 1e18
                console.log("exchangeRate",exchangeRate)
                const borrows = await lEtherContract.methods.totalBorrowsCurrent().call()
                console.log("borrows", borrows)
                const borrowRate = (await lEtherContract.methods.borrowRatePerBlock().call()) / 1e18
                console.log("borrowRate", borrowRate)
                const reserves = await lEtherContract.methods.totalReserves().call()
                console.log("reserves", reserves)
                const tokens = await lEtherContract.methods.totalSupply().call()
                console.log("tokens", tokens)
                const supplyRate = (await lEtherContract.methods.supplyRatePerBlock().call()) / 1e18
                console.log("supplyRate", supplyRate)
                const reserveFactor = (await lEtherContract.methods.reserveFactorMantissa().call()) / 1e18
                console.log("reserveFactor", reserveFactor)

                const ethMantissa = 1e18
                const blocksPerDay = 17 * 60 * 24
                const daysPerYear = 365
                const supplyRatePerBlock = await lEtherContract.methods.supplyRatePerBlock().call()
                const borrowRatePerBlock = await lEtherContract.methods.borrowRatePerBlock().call()
                const supplyApy = (Math.pow((supplyRatePerBlock / ethMantissa) * blocksPerDay + 1, daysPerYear) - 1) * 100
                const borrowApy = (Math.pow((borrowRatePerBlock / ethMantissa) * blocksPerDay + 1, daysPerYear) - 1) * 100
                console.log(`Supply APY for ETH ${supplyApy} %`)
                console.log(`Borrow APY for ETH ${borrowApy} %`)
            }
        }, 3000)
        return () => {
            clearInterval(timer)
        }
    }, [account])

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
                        <span className={styles.borrowed}>$ 0.00000</span>
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
                            <p className={styles.sub_titles}>Distribution APY</p>
                        </span>
                        <span className={styles.none}>
                            <button onClick={() => showAlert()}>Deposit / Borrow</button>
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
                            <p className={styles.sub_titles}>Distribution APY</p>
                        </span>
                        <span className={styles.none}>
                            <button onClick={() => showAlert()}>Deposit / Borrow</button>
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
                            <p className={styles.sub_titles}>Distribution APY</p>
                        </span>
                        <span className={styles.none}>
                            <button onClick={() => showAlert()}>Deposit / Borrow</button>
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
                            <p className={styles.sub_titles}>Distribution APY</p>
                        </span>
                        <span className={styles.none}>
                            <button onClick={() => showAlert()}>Deposit / Borrow</button>
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
                        className={cx(styles.lend_box, styles.approve, styles.usdt)}
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
                                            <span className={styles.num}>65.86%</span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Distribution APY</span>
                                            <span className={styles.num}>35.86%</span>
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
                                    <button className={styles.none}>Close</button>
                                    <button className={styles.green}>ENABLE</button>
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
                                            <span className={styles.num}>65.86%</span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Distribution APY</span>
                                            <span className={styles.num}>35.86%</span>
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
                                            <span className={styles.num}>65.86%</span>
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <span>Distribution APY</span>
                                            <span className={styles.num}>35.86%</span>
                                        </p>
                                        <p className={styles.bar}>
                                            <span className={styles.inner}></span>
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
                                    <button className={styles.none}>Close</button>
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
