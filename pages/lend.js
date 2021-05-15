import Head from "next/head"
import { useEffect, useState } from "react"
import useWallet from "use-wallet"
import { withTranslation } from "../i18n"
import HeaderFooter from "../layout/HeaderFooter"
import classNames from "classnames/bind"
import styles from "../styles/lend.less"
import { confirmAlert } from "react-confirm-alert"
import { ToastContainer } from "react-toastify"
import tokenConfig from "../contract.config"
import Pool from "../components/pool"
import { formatUSDNmuber, formatNumber } from "../libs/utils"
const cx = classNames.bind(styles)
import Web3 from "web3"
import BigNumber from "bignumber.js"
import { withRouter } from "next/router"
import { getPrice, getLendInfo } from "../api/api"

const Home = ({ t, router }) => {
    const wallet = useWallet()
    const { account, ethereum } = wallet
    const [lemdPrice, setLemdPrice] = useState(1)
    const [poolDate, setPoolDate] = useState([{}, {}, {}, {}, {}])
    const [supplyBalance, setSupplyBalance] = useState(0)
    const [borrowBalance, setBorrowBalance] = useState(0)
    const [borrowBalanceLimit, setBorrowBalanceLimit] = useState(0)
    const [borrowRate, setBorrowRate] = useState(0)
    const [pendingLemd, setPendingLemd] = useState(0)
    const [poolInfo, setPoolInfo] = useState([{},{},{},{},{}])

    const web3 = new Web3(ethereum)
    const { OKT, OKB, USDT, ETHK, BTCK } = tokenConfig.lend.tokens
    const { lEther, lOKB, lUSDT, lETHK, lBTCK } = tokenConfig.lend.lTokens
    const { lemdDistribution } = tokenConfig.lend.controller
    const lemdDistributionContract = new web3.eth.Contract(lemdDistribution.abi, lemdDistribution.address)

    const updatePoolDate = (data, index) => {
        poolDate[index] = data
        setPoolDate(poolDate)
    }

    useEffect(() => {
        const timer = setInterval(async () => {
            const { data } = await getPrice()
            setLemdPrice(data?.lemond?.usd)
            const lendInfo = await getLendInfo()
            console.log(lendInfo?.data?.data)
            setPoolInfo(lendInfo?.data?.data)
            if (account) {
                console.log(poolDate)
                let supplyBalance = 0
                let borrowBalance = 0
                let borrowBalanceLimit = 0
                let borrowRate = 0
                for (const index in poolDate) {
                    if (JSON.stringify(poolDate[index]) != "{}") {
                        supplyBalance += parseInt(poolDate[index].supplyBalance)
                        borrowBalance += parseInt(poolDate[index].borrowBalance)
                        borrowBalanceLimit = new BigNumber(borrowBalanceLimit).plus(poolDate[index].borrowBalanceLimit)
                        console.log("borrowBalanceLimit", poolDate[index].borrowBalanceLimit.toString())
                    }
                }
                borrowRate = new BigNumber(borrowBalance).div(borrowBalanceLimit).times(100).toFixed(2)
                borrowRate = isNaN(borrowRate) ? 0 : borrowRate

                const pendingLemd = await lemdDistributionContract.methods.pendingLemdAccrued(account, true, true).call()

                setSupplyBalance(supplyBalance)
                setBorrowBalance(borrowBalance)
                setBorrowBalanceLimit(borrowBalanceLimit.toFixed(2))
                setBorrowRate(borrowRate)
                setPendingLemd(pendingLemd)

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

    const claim = async () => {
        if (checkWallet()) return
        await lemdDistributionContract.methods.claimLemd(account).send({ from: account })
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
                        {/* <span className={styles.text}>
                            <h2>Net APY</h2>
                            <p>0.00%</p>
                        </span> */}
                        <i className={styles.lemond1}></i>
                        <i className={styles.lemond2}></i>
                        <i className={styles.lemond3}></i>
                        <i className={styles.lemond4}></i>
                        <i className={styles.lemond5}></i>
                    </h1>
                    <div className={cx(styles.supplyText, styles.price)}>
                        <h3>LEMD Price</h3>
                        <p>{formatUSDNmuber(lemdPrice, 2)}</p>
                    </div>
                    <div className={styles.supplyText}>
                        <h3>Supply Balance</h3>
                        <p>{formatUSDNmuber(supplyBalance, 2)}</p>
                    </div>
                    <div className={cx(styles.borrowText, styles.price)}>
                        <h3>Pending LEMD</h3>
                        <p>
                            {formatNumber(pendingLemd, 18, 4)}
                            <button onClick={() => claim()}>Claim</button>
                        </p>
                    </div>
                    <div className={styles.borrowText}>
                        <h3>Borrow Balance</h3>
                        <p>{formatUSDNmuber(borrowBalance, 2)}</p>
                    </div>
                    <div className={styles.lend_line}>
                        <div className={styles.line}>
                            <i className={styles.inner} style={{ width: `${borrowRate}%` }}>
                                <span className={styles.line_light}></span>
                                <i />
                            </i>
                        </div>
                        <span className={styles.text}>Borrow Limit</span>
                        <span className={styles.num}>{formatUSDNmuber(borrowBalanceLimit, 2)}</span>
                        <span className={styles.borrowed}>{borrowRate} %</span>
                    </div>
                </div>
                <ul className={styles.lend_list}>
                    <Pool
                        router={router}
                        lemdPrice={lemdPrice}
                        info={poolInfo[0]}
                        token={OKT}
                        lToken={lEther}
                        borrow={borrowBalance}
                        borrowLimit={borrowBalanceLimit}
                        borrowRate={borrowRate}
                        updateDate={(data) => updatePoolDate(data, 0)}
                    />
                    <Pool
                        router={router}
                        lemdPrice={lemdPrice}
                        info={poolInfo[1]}
                        token={OKB}
                        lToken={lOKB}
                        borrow={borrowBalance}
                        borrowLimit={borrowBalanceLimit}
                        borrowRate={borrowRate}
                        updateDate={(data) => updatePoolDate(data, 1)}
                    />
                    <Pool
                        router={router}
                        lemdPrice={lemdPrice}
                        info={poolInfo[2]}
                        token={USDT}
                        lToken={lUSDT}
                        borrow={borrowBalance}
                        borrowLimit={borrowBalanceLimit}
                        borrowRate={borrowRate}
                        updateDate={(data) => updatePoolDate(data, 2)}
                    />
                    <Pool
                        router={router}
                        lemdPrice={lemdPrice}
                        info={poolInfo[3]}
                        token={ETHK}
                        lToken={lETHK}
                        borrow={borrowBalance}
                        borrowLimit={borrowBalanceLimit}
                        borrowRate={borrowRate}
                        updateDate={(data) => updatePoolDate(data, 3)}
                    />
                    <Pool
                        router={router}
                        lemdPrice={lemdPrice}
                        info={poolInfo[4]}
                        token={BTCK}
                        lToken={lBTCK}
                        borrow={borrowBalance}
                        borrowLimit={borrowBalanceLimit}
                        borrowRate={borrowRate}
                        updateDate={(data) => updatePoolDate(data, 4)}
                    />
                </ul>
            </div>
        </HeaderFooter>
    )
}

Home.getInitialProps = async () => ({
    namespacesRequired: ["common", "header", "home"],
})

export default withTranslation("home")(withRouter(Home))