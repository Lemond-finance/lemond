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
import tokenConfig from "../contract.config"
import Pool from "../components/pool"
import { formatUSDNmuber, formatNmuber } from "../libs/utils"
const cx = classNames.bind(styles)
import Web3 from "web3"
import BigNumber from "bignumber.js"
import Clipboard from "react-clipboard.js"
import { withRouter } from "next/router"

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

    const [remainingLemd, setRemainingLemd] = useState(0)
    const [inviteAmount, setInviteAmount] = useState(0)
    const [invitedMintAmount, setInvitedMintAmount] = useState(0)
    const [maxInvitedMintAmount, setMaxInvitedMintAmount] = useState(0)


    const web3 = new Web3(ethereum)
    const { lemond } = tokenConfig.token
    const lemdContract = new web3.eth.Contract(lemond.abi, lemond.address)
    const { OKT, OKB, USDT, ETHK, BTCK } = tokenConfig.lend.tokens
    const { lEther, lOKB, lUSDT, lETHK, lBTCK } = tokenConfig.lend.lTokens
    const { lemdDistribution, comptroller } = tokenConfig.lend.controller
    const lemdDistributionContract = new web3.eth.Contract(lemdDistribution.abi, lemdDistribution.address)
    const comptrollerContract = new web3.eth.Contract(comptroller.abi, comptroller.address)

    const updatePoolDate = (data, index) => {
        poolDate[index] = data
        setPoolDate(poolDate)
    }

    useEffect(() => {
        const timer = setInterval(async () => {
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

                const pendingLemd = await lemdDistributionContract.methods.pendingLemdAccrued(account, true, true).call()

                const remainingLemd = await lemdContract.methods.balanceOf(lemdDistribution.address).call()
                console.log("RemainingLemd", remainingLemd)
                const inviteAmount = (await comptrollerContract.methods.getInvites(account).call()).length
                console.log("inviteAmount", inviteAmount)
                const invitedMintAmount = await comptrollerContract.methods.getInvitedMintAmount(account).call()
                console.log("invitedMintAmount", invitedMintAmount)
                const maxInvitedMintAmount = await comptrollerContract.methods.getMaxInvitedMintAmount(account).call()
                console.log("maxInvitedMintAmount", maxInvitedMintAmount)

                setSupplyBalance(supplyBalance)
                setBorrowBalance(borrowBalance)
                setBorrowBalanceLimit(borrowBalanceLimit.toFixed(2))
                setBorrowRate(borrowRate)
                setPendingLemd(pendingLemd)

                setRemainingLemd(remainingLemd)
                setInviteAmount(inviteAmount)
                setInvitedMintAmount(invitedMintAmount)
                setMaxInvitedMintAmount(maxInvitedMintAmount)

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
                            {/* {formatNmuber(pendingLemd, 18, 4)} */}
                            0
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
                <div className={styles.lend_news}>
                    <span className={styles.rules}>
                        <h1>Airdrop Episode II</h1>
                        <p>
                            Total LEMD to be airdropped : <b>500,000 LEMD</b>
                            <br />
                            Period of airdrop: <b>12.00 UTC, Apr 18 to 12.00 UTC, Apr 25</b>
                        </p>
                        <p>*Real minted LEMD for Airdrop Episode II will be distributed on a 1:1 basis before the official launch of OKExChain by further notice.</p>
                        <h1>Invite to Claim MORE!</h1>
                        <p>
                            You can invite up to <b>5</b> persons to increase your max amount of claiming from <b>10</b> to <b>60</b>.(10 up per invited person)
                        </p>
                        <p>*Effect will be activated after invited person supplies in the pool.</p>
                    </span>
                    <span className={cx(styles.rules, styles.info)}>
                        <h2>
                            <span>LEMD Remaining:</span>
                            <span>
                                <b>{formatNmuber(remainingLemd, 18, 2)}</b>
                            </span>
                        </h2>
                        <h2>
                            <span>Persons Invited:</span>
                            <span>
                                <b>{inviteAmount}</b>
                            </span>
                        </h2>
                        <h2>
                            <span>Claim Cap:</span>
                            <span>
                                <b>
                                    {formatNmuber(invitedMintAmount, 18, 2)}/{formatNmuber(maxInvitedMintAmount, 18, 2)}
                                </b>
                            </span>
                        </h2>
                        <p>
                            <Clipboard
                                className={styles.btn}
                                onClick={() => {
                                    if (checkWallet()) return
                                    toast.dark("🚀 Copy success!", toastConfig)
                                }}
                                data-clipboard-text={`http://lemond.money/lend?inviter=${account}`}
                            >
                                Copy Link & Share
                            </Clipboard>
                        </p>
                        <p>
                            Click for{" "}
                            <a target="_blank" href="https://lemondfinance.medium.com/lemond-x-okexchain-loan-to-get-airdrop-5d980bc3da56">
                                detailed instructions.
                            </a>
                        </p>
                    </span>
                </div>
                <ul className={styles.lend_list}>
                    <Pool
                        router={router}
                        lemdPrice={lemdPrice}
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