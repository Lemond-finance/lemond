import Head from "next/head"
import { useEffect, useState } from "react"
import useWallet from "use-wallet"
import { Link, withTranslation } from "../i18n"
import classNames from "classnames/bind"
import styles from "../styles/lend.less"
import { confirmAlert } from "react-confirm-alert"
import { ToastContainer, toast } from "react-toastify"
import { toastConfig } from "../libs/utils"
import {
    fromUSD,
    fromAPY,
    formatUSDNumer,
    fromBigNumber,
    from10FormatETHWeiNumber,
    fromFormatBigNumber,
    fromFormatETHWeiNumber,
    toWeiNumber,
    to10WeiNumber,
    fromETHWeiNumber,
    from10ETHWeiNumber,
} from "../libs/utils"
import tokenConfig from "../contract.config"
import BigNumber from "bignumber.js"
import Switch from "react-switch"
const cx = classNames.bind(styles)
import Web3 from "web3"

const Pool = ({ t, lemdPrice, token, lToken, borrow, borrowLimit, borrowRate, updateDate }) => {
    const wallet = useWallet()
    const { account, ethereum } = wallet
    const [tokenBalance, setTokenBalance] = useState(0)
    const [tokenPrice, setTokenPrice] = useState(0)
    const [supplyApy, setSupplyApy] = useState(0)
    const [borrowApy, setBorrowApy] = useState(0)
    const [marketSize, setMarketSize] = useState(0)
    const [totalBorrow, setTotalBorrow] = useState(0)
    const [supplyBalance, setSupplyBalance] = useState(0)
    const [supplyBalanceAmount, setSupplyBalanceAmount] = useState(0)
    const [borrowBalance, setBorrowBalance] = useState(0)
    const [borrowBalanceAmount, setBorrowBalanceAmount] = useState(0)
    const [supplyRewardAPY, setSupplyRewardAPY] = useState(0)
    const [borrowRewardAPY, setBorrowRewardAPY] = useState(0)
    const [totalSupplyAPY, setTotalSupplyAPY] = useState(0)
    const [totalBorrowAPY, setTotalBorrowAPY] = useState(0)
    const [showPanel, setShowPanel] = useState(false)
    const [switchSupply, setSwitchSupply] = useState(true)
    const [switchBorrow, setSwitchBorrow] = useState(true)
    const [supplyValue, setSupplyValue] = useState(0)
    const [borrowValue, setBorrowValue] = useState(0)
    const [supplyEnable, setSupplyEnable] = useState(true)
    const [borrowEnable, setBorrowEnable] = useState(true)
    const [enterMarkets, setEnterMarkets] = useState(false)

    var closeFn;

    const web3 = new Web3(ethereum)
    const { comptroller, lemdDistribution, priceOracle } = tokenConfig.lend.controller
    const tokenContract = new web3.eth.Contract(token.abi, token.address)
    const lTokenContract = new web3.eth.Contract(lToken.abi, lToken.address)
    const comptrollerContract = new web3.eth.Contract(comptroller.abi, comptroller.address)
    const lemdDistributionContract = new web3.eth.Contract(lemdDistribution.abi, lemdDistribution.address)
    const priceOracleContract = new web3.eth.Contract(priceOracle.abi, priceOracle.address)

    useEffect(() => {
        const timer = setInterval(async () => {
            if (account) {
                var ethMantissa = 1e18
                if (lToken.name != "OKT") {
                    ethMantissa = 1e10
                }
                var digits = 18
                if (lToken.name != "OKT") {
                    digits = 10
                }
                const blocksPerDay = 17 * 60 * 24
                const daysPerYear = 365
                const supplyRatePerBlock = await lTokenContract.methods.supplyRatePerBlock().call()
                const borrowRatePerBlock = await lTokenContract.methods.borrowRatePerBlock().call()
                const tokenBalance = lToken.name != "OKT" ? await tokenContract.methods.balanceOf(account).call() : await web3.eth.getBalance(account)
                const supplyEnable = lToken.name != "OKT" ? (await tokenContract.methods.allowance(account, lToken.address).call()) > 0 : true
                const borrowEnable = lToken.name != "OKT" ? (await lTokenContract.methods.allowance(account, lToken.address).call()) > 0 : true
                const supplyApy = ((Math.pow((supplyRatePerBlock / ethMantissa) * blocksPerDay + 1, daysPerYear) - 1) * 100).toFixed(2)
                console.log("supplyApy", supplyApy)
                const borrowApy = (((borrowRatePerBlock / ethMantissa) * blocksPerDay + 1) * 100).toFixed(2)
                console.log("borrowApy", borrowApy)
                const totalSupply = await lTokenContract.methods.totalSupply().call()
                console.log("totalSupply", totalSupply)
                const tokenPrice = await priceOracleContract.methods.getUnderlyingPrice(lToken.address).call()
                console.log("tokenPrice", tokenPrice)
                const exchangeRate = (await lTokenContract.methods.exchangeRateCurrent().call()) / ethMantissa
                console.log("exchangeRate", exchangeRate)
                const marketSize = new BigNumber(totalSupply).times(exchangeRate).times(tokenPrice).div(new BigNumber(10).pow(18)).div(new BigNumber(10).pow(18)).toFixed(2)
                console.log("marketSize", marketSize)
                const totalBorrow = new BigNumber(await lTokenContract.methods.totalBorrowsCurrent().call()).div(new BigNumber(10).pow(18)).times(tokenPrice).div(new BigNumber(10).pow(18)).toFixed(2)
                console.log("totalBorrow", totalBorrow)

                const accountSnapshot = await lTokenContract.methods.getAccountSnapshot(account).call()
                console.log("accountSnapshot", accountSnapshot)

                const market = await comptrollerContract.methods.markets(lToken.address).call()
                console.log("market", market)

                const supplyBalanceAmount = new BigNumber(accountSnapshot[1]).times(accountSnapshot[3]).div(new BigNumber(10).pow(18)).div(new BigNumber(10).pow(digits)).toString()
                console.log("supplyBalanceAmount", supplyBalanceAmount)
                const supplyBalance = new BigNumber(supplyBalanceAmount).times(tokenPrice).div(new BigNumber(10).pow(18)).toString()
                console.log("supplyBalance", supplyBalance)
                const borrowBalanceAmount = new BigNumber(accountSnapshot[2]).div(new BigNumber(10).pow(digits)).toString()
                console.log("borrowBalanceAmount", borrowBalanceAmount)
                const borrowBalance = new BigNumber(borrowBalanceAmount).times(tokenPrice).div(new BigNumber(10).pow(18)).toString()
                console.log("borrowBalance", borrowBalance)
                const borrowBalanceLimit = new BigNumber(accountSnapshot[1])
                    .times(accountSnapshot[3])
                    .times(tokenPrice)
                    .times(market[1])
                    .div(new BigNumber(10).pow(18))
                    .div(new BigNumber(10).pow(18))
                    .div(new BigNumber(10).pow(18))
                    .div(new BigNumber(10).pow(digits))

                const lemdSpeedPerBlock = new BigNumber(await lemdDistributionContract.methods.lemdSpeeds(lToken.address).call()).div(new BigNumber(10).pow(18)).times(lemdPrice)
                console.log("lemdSpeed", lemdSpeedPerBlock.toFixed())
                const supplyRewardAPY = new BigNumber(lemdSpeedPerBlock).times(blocksPerDay).times(daysPerYear).div(marketSize).times(100).toFixed(2)
                const borrowRewardAPY = new BigNumber(lemdSpeedPerBlock).times(blocksPerDay).times(daysPerYear).div(totalBorrow).times(100).toFixed(2)
                console.log("supplyRewardAPY", supplyRewardAPY)
                console.log("borrowRewardAPY", borrowRewardAPY)

                const totalSupplyAPY = parseFloat(supplyApy) + parseFloat(supplyRewardAPY == Infinity ? 0 : supplyRewardAPY)
                const totalBorrowAPY = parseFloat(borrowApy) - parseFloat(borrowRewardAPY == Infinity ? 0 : borrowRewardAPY)
                console.log("totalSupplyAPY", totalSupplyAPY)
                console.log("totalBorrowAPY", totalBorrowAPY)

                var enterMarkets = await comptrollerContract.methods.getAssetsIn(account).call()
                console.log("enterMarkets", enterMarkets, enterMarkets.indexOf(lToken.address))
                if (enterMarkets.indexOf(lToken.address) != -1) {
                    enterMarkets = true
                } else {
                    enterMarkets = false
                }
                setEnterMarkets(enterMarkets)
                setTokenBalance(tokenBalance)
                setTokenPrice(tokenPrice)
                setSupplyEnable(supplyEnable)
                setBorrowEnable(borrowEnable)
                setTotalBorrow(totalBorrow)
                setSupplyApy(supplyApy)
                setBorrowApy(borrowApy)
                setMarketSize(marketSize)
                setSupplyBalance(supplyBalance)
                setSupplyBalanceAmount(supplyBalanceAmount)
                setBorrowBalance(borrowBalance)
                setBorrowBalanceAmount(borrowBalanceAmount)
                setSupplyRewardAPY(parseFloat(supplyRewardAPY == Infinity ? 0 : supplyRewardAPY))
                setBorrowRewardAPY(parseFloat(borrowRewardAPY == Infinity ? 0 : borrowRewardAPY))
                setTotalSupplyAPY(totalSupplyAPY)
                setTotalBorrowAPY(totalBorrowAPY)

                updateDate({
                    supplyBalance: supplyBalance,
                    borrowBalance: borrowBalance,
                    borrowBalanceLimit: enterMarkets ? borrowBalanceLimit : 0,
                    exchangeRateMantissa: accountSnapshot[3],
                })
            }
        }, 2000)
        return () => {
            clearInterval(timer)
        }
    }, [account, updateDate])

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

    const loading = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                closeFn = onClose
                return (
                    <div className={styles.confirmAlert}>
                        <h1>Transaction Pending</h1>
                        <h1>
                            <div className="vs-loading radius">
                                <div className="effect-1 effects"></div>
                                <div className="effect-2 effects"></div>
                                <div className="effect-3 effects"></div>
                            </div>
                        </h1>
                        <p>Transaction broadcast.</p>
                        <p className={styles.center}>
                            <button onClick={onClose}> OK </button>
                        </p>
                    </div>
                )
            },
        })
    }

    const checkBorrowingLimit = () => {
        if (new BigNumber(supplyBalanceAmount).times(tokenPrice).div(new BigNumber(10).pow(18)) > new BigNumber(borrowLimit).minus(borrow)) {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className={styles.confirmAlert}>
                            <h1>Disable collateral</h1>
                            <p className={styles.center}>Each asset used as collateral will increase your borrowing limit. Please note that this may cause the asset to be seized in liquidation. </p>
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

    const tokenApprove = async () => {
        if (checkWallet()) return
        await tokenContract.methods.approve(lToken.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({ from: account })
        toast.dark("🚀 Approve success!", toastConfig)
    }

    const mint = async () => {
        if (checkWallet()) return
        if (checkZero(supplyValue * 1)) return
        loading()
        const value = lToken.name == "OKT" ? toWeiNumber(supplyValue) : to10WeiNumber(supplyValue)
        console.log(value, "OKT", lToken.name)
        if (lToken.name == "OKT") {
            await lTokenContract.methods.mint().send({ from: account, value: value })
        } else {
            await lTokenContract.methods.mint(value).send({ from: account })
        }
        setSupplyValue(0)
        closeFn()
        toast.dark("🚀 Mint success!", toastConfig)
    }

    const redeem = async () => {
        if (checkWallet()) return
        if (checkZero(supplyValue * 1)) return
        loading()
        const value = lToken.name == "OKT" ? toWeiNumber(supplyValue) : to10WeiNumber(supplyValue)
        console.log("redeem", value)
        await lTokenContract.methods.redeemUnderlying(value).send({ from: account })
        setSupplyValue(0)
        closeFn()
        toast.dark("🚀 Withdraw success!", toastConfig)
    }

    const lTokenApprove = async () => {
        if (checkWallet()) return
        await lTokenContract.methods.approve(lToken.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({ from: account })
        toast.dark("🚀 Approve success!", toastConfig)
    }

    const borrows = async () => {
        if (checkWallet()) return
        if (checkZero(borrowValue * 1)) return
        loading()
        const value = lToken.name == "OKT" ? toWeiNumber(borrowValue) : to10WeiNumber(borrowValue)
        await lTokenContract.methods.borrow(value).send({ from: account })
        setBorrowValue(0)
        closeFn()
        toast.dark("🚀 Borrow success!", toastConfig)
    }

    const repay = async () => {
        if (checkWallet()) return
        if (checkZero(borrowValue * 1)) return
        loading()
        const value = lToken.name == "OKT" ? toWeiNumber(borrowValue) : to10WeiNumber(borrowValue)
        if (lToken.name == "OKT") {
            await lTokenContract.methods.repayBorrow().send({ from: account, value: value })
        } else {
            await lTokenContract.methods.repayBorrow(value).send({ from: account })
        }
        setBorrowValue(0)
        closeFn()
        toast.dark("🚀 Repay success!", toastConfig)
    }

    const enterMarket = async () => {
        if (checkWallet()) return
        loading()
        await comptrollerContract.methods.enterMarkets([lToken.address]).send({ from: account })
        setEnterMarkets(true)
        closeFn()
        toast.dark("🚀 Enter market success!", toastConfig)
    }

    const exitMarket = async () => {
        if (checkWallet()) return
        if (checkBorrowingLimit()) return
        loading()
        await comptrollerContract.methods.exitMarket(lToken.address).send({ from: account })
        setEnterMarkets(false)
        closeFn()
        toast.dark("🚀 Exit market success!", toastConfig)
    }

    return (
        <li className={cx(lToken.className)}>
            <ToastContainer />
            <span className={styles.total_info}>
                <span className={styles.icon}></span>
                <span className={styles.left}>
                    <p>{lToken.name}</p>
                    <p className={styles.sub_title}>{lToken.description}</p>
                </span>
                <span>
                    <p>{formatUSDNumer(marketSize)}</p>
                    <p className={styles.sub_titles}>Market size</p>
                </span>
                <span>
                    <p>{formatUSDNumer(totalBorrow)}</p>
                    <p className={styles.sub_titles}>Total borrowed</p>
                </span>
                <span>
                    <p>{fromAPY(totalSupplyAPY)}%</p>
                    <p className={styles.sub_titles}>Deposit APY</p>
                </span>
                <span className={styles.border_right}>
                    <p>{fromAPY(totalBorrowAPY)}%</p>
                    <p className={styles.sub_titles}>Borrow APY</p>
                </span>
                <span>
                    <h4>
                        <s>
                            {fromAPY(supplyBalanceAmount)}
                            <b>{lToken.name}</b>
                        </s>
                        <s>{fromUSD(supplyBalance)}</s>
                    </h4>
                    <p className={styles.sub_titles}>Supply Balance</p>
                </span>
                <span>
                    <h4>
                        <s>
                            {fromAPY(borrowBalanceAmount)}
                            <b>{lToken.name}</b>
                        </s>
                        <s>{fromUSD(borrowBalance)}</s>
                    </h4>
                    <p className={styles.sub_titles}>Borrow Balance</p>
                </span>

                <span className={cx(styles.none, styles.width_auto)}>
                    <button className={cx({ pick_up: showPanel })} onClick={() => setShowPanel(!showPanel)}>
                        {showPanel ? "-" : "＋"}
                    </button>
                </span>
            </span>
            <span className={cx(styles.operation, { none: !showPanel })}>
                <dl>
                    <dt>
                        <div
                            className={cx(styles.lend_box, styles.approve, styles.border, styles.usdt)}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                        >
                            <ul className={styles.tabs}>
                                <li
                                    className={cx({ active: switchSupply })}
                                    onClick={() => {
                                        setSwitchSupply(true)
                                    }}
                                >
                                    SUPPLY
                                </li>
                                <li
                                    className={cx({ active: !switchSupply })}
                                    onClick={() => {
                                        setSwitchSupply(false)
                                    }}
                                >
                                    WITHDRAW
                                </li>
                            </ul>
                            <div className={styles.enter_markets}>
                                <Switch
                                    height={10}
                                    width={50}
                                    handleDiameter={20}
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    onColor="#F6BA5E"
                                    onHandleColor="#ffffff"
                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                    onChange={() => {!enterMarkets ? enterMarket() : exitMarket()}}
                                    checked={enterMarkets}
                                />
                                <p>As Collateral</p>
                            </div>
                            <div className={styles.content}>
                                <div className={styles.inputAction}>
                                    <h1>{switchSupply ? "Supply Amount" : "WITHDRAW Amount"}</h1>
                                    <input type="text" placeholder="0" value={supplyValue} onChange={(e) => setSupplyValue(e.target.value)} />
                                    <button
                                        onClick={() => {
                                            if (switchSupply) {
                                                const value = lToken.name == "OKT" ? fromETHWeiNumber(tokenBalance) : from10ETHWeiNumber(tokenBalance)
                                                setSupplyValue(value)
                                            } else {
                                                const value = new BigNumber(borrowLimit)
                                                    .minus(borrow)
                                                    .div(new BigNumber(tokenPrice).div(new BigNumber(10).pow(18)))
                                                setSupplyValue(parseFloat(value) > parseFloat(supplyBalanceAmount) ? supplyBalanceAmount : value)
                                            }
                                        }}
                                    >
                                        MAX
                                    </button>
                                </div>
                                <div className={styles.info}>
                                    <h1>Supply Rates</h1>
                                    <ul>
                                        <li>
                                            <p>
                                                <span>Supply APY</span>
                                                <span className={styles.num}>{supplyApy}%</span>
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                <span>Distribution APY</span>
                                                <span className={styles.num}>{supplyRewardAPY}%</span>
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={styles.tools}>
                            <span className={styles.btns}>
                                {!supplyEnable && switchSupply && (
                                    <button className={styles.green} onClick={() => tokenApprove()}>
                                        ENABLE
                                    </button>
                                )}
                                {supplyEnable && switchSupply && (
                                    <button
                                        disabled={
                                            supplyValue == 0 ||
                                            parseFloat(supplyValue) > parseFloat(lToken.name == "OKT" ? fromFormatETHWeiNumber(tokenBalance) : from10FormatETHWeiNumber(tokenBalance))
                                        }
                                        className={styles.green}
                                        onClick={() => mint()}
                                    >
                                        {parseFloat(supplyValue) > parseFloat(lToken.name == "OKT" ? fromFormatETHWeiNumber(tokenBalance) : from10FormatETHWeiNumber(tokenBalance))
                                            ? "NO FUNDS AVAILABLE"
                                            : "SUPPLY"}
                                    </button>
                                )}
                                {!switchSupply && (
                                    <button disabled={supplyValue == 0 || parseFloat(supplyValue) > parseFloat(supplyBalanceAmount)} className={styles.green} onClick={() => redeem()}>
                                        {parseFloat(supplyValue) > parseFloat(supplyBalanceAmount) ? "INSUFFICIENT LIQUIDITY" : "WITHDRAW"}
                                    </button>
                                )}
                            </span>
                            <span className={styles.balance}>
                                <h1>
                                    {switchSupply && (lToken.name == "OKT" ? fromFormatETHWeiNumber(tokenBalance) : from10FormatETHWeiNumber(tokenBalance))}
                                    {!switchSupply && fromFormatBigNumber(supplyBalanceAmount)} <b>{lToken.name}</b>
                                </h1>
                                <p>
                                    {switchSupply && "Wallet Balance"}
                                    {!switchSupply && "Currently Supplying"}
                                </p>
                            </span>
                        </div>
                    </dt>
                    <dt>
                        <div
                            className={cx(styles.lend_box, styles.approve, styles.usdt)}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                        >
                            <ul className={styles.tabs}>
                                <li
                                    className={cx({ active: switchBorrow })}
                                    onClick={() => {
                                        setSwitchBorrow(true)
                                    }}
                                >
                                    BORROW
                                </li>
                                <li
                                    className={cx({ active: !switchBorrow })}
                                    onClick={() => {
                                        setSwitchBorrow(false)
                                    }}
                                >
                                    REPAY
                                </li>
                            </ul>
                            <div className={styles.content}>
                                <div className={styles.inputAction}>
                                    <h1>{switchBorrow ? "BORROW Amount" : "REPAY Amount"}</h1>
                                    <input type="text" placeholder="0" value={borrowValue} onChange={(e) => setBorrowValue(e.target.value)} />
                                    <button
                                        onClick={() => {
                                            if (switchBorrow) {
                                                const value = new BigNumber(borrowLimit)
                                                    .minus(borrow)
                                                    .div(new BigNumber(tokenPrice).div(new BigNumber(10).pow(18)))
                                                setBorrowValue(value)
                                            } else {
                                                setBorrowValue(borrowBalanceAmount)
                                            }
                                        }}
                                    >
                                        MAX
                                    </button>
                                </div>
                                <div className={styles.info}>
                                    <h1>Borrow Rates</h1>
                                    <ul>
                                        <li>
                                            <p>
                                                <span>Borrow APY</span>
                                                <span className={styles.num}>{borrowApy}%</span>
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                <span>Distribution APY</span>
                                                <span className={styles.num}>{borrowRewardAPY}%</span>
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={styles.tools}>
                            <span className={cx(styles.btns, styles.fr)}>
                                {!borrowEnable && !switchBorrow && (
                                    <button className={styles.green} onClick={() => lTokenApprove()}>
                                        ENABLE
                                    </button>
                                )}
                                {switchBorrow && (
                                    <button
                                        disabled={
                                            borrowValue == 0 ||
                                            parseFloat(borrowValue) > parseFloat(new BigNumber(borrowLimit).minus(borrow).div(new BigNumber(tokenPrice).div(new BigNumber(10).pow(18))))
                                        }
                                        className={styles.green}
                                        onClick={() => borrows()}
                                    >
                                        {parseFloat(borrowValue) > parseFloat(new BigNumber(borrowLimit).minus(borrow).div(new BigNumber(tokenPrice).div(new BigNumber(10).pow(18))))
                                            ? "INSUFFICIENT COLLATERAL"
                                            : "BORROW"}
                                    </button>
                                )}
                                {borrowEnable && !switchBorrow && (
                                    <button disabled={borrowValue == 0 || parseFloat(borrowValue) > parseFloat(borrowBalanceAmount)} className={styles.green} onClick={() => repay()}>
                                        {parseFloat(borrowValue) > parseFloat(borrowBalanceAmount) ? "NO FUNDS AVAILABLE" : "REPAY"}
                                    </button>
                                )}
                            </span>
                            <span className={cx(styles.balance, styles.fr)}>
                                <h1>
                                    {switchBorrow && fromFormatBigNumber(borrowBalanceAmount)}
                                    {!switchBorrow && (lToken.name == "OKT" ? fromFormatETHWeiNumber(tokenBalance) : from10FormatETHWeiNumber(tokenBalance))} <b>{lToken.name}</b>
                                </h1>
                                <p>
                                    {switchBorrow && "Currently Borrowing"}
                                    {!switchBorrow && "Wallet Balance"}
                                </p>
                            </span>
                        </div>
                    </dt>
                </dl>
                <span className={styles.borrow_limit}>
                    <span className={styles.item}>
                        <h1>{fromUSD(borrow)}</h1>
                        <p>Borrow Limit</p>
                    </span>
                    <span className={styles.item}>
                        <h1>{fromUSD(borrowLimit)}</h1>
                        <p>Borrow Limit Used</p>
                    </span>
                    <span className={styles.bar}>
                        <i className={styles.inner} style={{ width: `${borrowRate}%` }}></i>
                    </span>
                </span>
            </span>
        </li>
    )
}

Pool.getInitialProps = async () => ({
    namespacesRequired: ["common", "header", "home"],
})

export default withTranslation("home")(Pool)
