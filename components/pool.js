import Head from "next/head"
import { useEffect, useState } from "react"
import useWallet from "use-wallet"
import { withTranslation } from "../i18n"
import classNames from "classnames/bind"
import styles from "../styles/lend.less"
import { confirmAlert } from "react-confirm-alert"
import { ToastContainer, toast } from "react-toastify"
import { toastConfig } from "../libs/utils"
import { formatUSDNmuber, formatThousandNumber, formatAverageNumber, formatNumber, formatDecimals, unFormatNumber, formatStringNumber } from "../libs/utils"
import tokenConfig from "../contract.config"
import BigNumber from "bignumber.js"
import Switch from "react-switch"
const cx = classNames.bind(styles)
import Web3 from "web3"

const Pool = ({ t, router, lemdPrice, info, token, lToken, borrow, borrowLimit, borrowRate, updateDate }) => {
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
    const [remaining, setRemaining] = useState(0)

    var closeFn

    const web3 = new Web3(ethereum)
    const { comptroller, priceOracle } = tokenConfig.lend.controller
    const tokenContract = new web3.eth.Contract(token.abi, token.address)
    const lTokenContract = new web3.eth.Contract(lToken.abi, lToken.address)
    const comptrollerContract = new web3.eth.Contract(comptroller.abi, comptroller.address)
    const priceOracleContract = new web3.eth.Contract(priceOracle.abi, priceOracle.address)

    var digits = 18
    if (lToken.name != "OKT") {
        digits = 10
    }

    useEffect(() => {
        const timer = setInterval(async () => {
            console.log("info", info)
            if (JSON.stringify(info) != "{}") {
                const { market_size, total_borrow, deposit_total_apy, borrow_total_apy, supply_apy, supply_distribution_apy, borrow_apy, borrow_distribution_apy } = info
                setMarketSize(market_size)
                setTotalBorrow(total_borrow)
                setTotalSupplyAPY(deposit_total_apy)
                setTotalBorrowAPY(borrow_total_apy)
                setSupplyApy(supply_apy)
                setSupplyRewardAPY(parseFloat(supply_distribution_apy == Infinity ? 0 : supply_distribution_apy))
                setBorrowApy(borrow_apy)
                setBorrowRewardAPY(parseFloat(borrow_distribution_apy == Infinity ? 0 : borrow_distribution_apy))
            }

            if (account) {
                var ethMantissa = 1e18
                if (lToken.name != "OKT") {
                    ethMantissa = 1e10
                }
                const tokenBalance = lToken.name != "OKT" ? await tokenContract.methods.balanceOf(account).call() : await web3.eth.getBalance(account)
                const supplyEnable = lToken.name != "OKT" ? (await tokenContract.methods.allowance(account, lToken.address).call()) > 0 : true
                const borrowEnable = lToken.name != "OKT" ? (await lTokenContract.methods.allowance(account, lToken.address).call()) > 0 : true
                const totalSupply = await lTokenContract.methods.totalSupply().call()
                console.log("totalSupply", totalSupply)
                const tokenPrice = await priceOracleContract.methods.getUnderlyingPrice(lToken.address).call()
                console.log("tokenPrice", tokenPrice)
                const exchangeRate = (await lTokenContract.methods.exchangeRateCurrent().call()) / ethMantissa
                console.log("exchangeRate", exchangeRate)
                const totalBorrowsCurrent = await lTokenContract.methods.totalBorrowsCurrent().call()
                const totalBorrow = new BigNumber(totalBorrowsCurrent).div(new BigNumber(10).pow(digits)).times(tokenPrice).div(new BigNumber(10).pow(18)).toFixed(2)
                console.log("totalBorrow", totalBorrow)
                const remaining = new BigNumber(totalSupply)
                    .times(exchangeRate)
                    .div(new BigNumber(10).pow(18))
                    .minus(new BigNumber(totalBorrowsCurrent).div(new BigNumber(10).pow(digits)))
                console.log(
                    lToken.name,
                    "remaining",
                    remaining.toString(),
                    new BigNumber(totalSupply).times(exchangeRate).div(new BigNumber(10).pow(18)).toString(),
                    new BigNumber(totalBorrowsCurrent).div(new BigNumber(10).pow(digits)).toString(),
                )

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
                setRemaining(remaining)
                setSupplyBalance(supplyBalance)
                setSupplyBalanceAmount(supplyBalanceAmount)
                setBorrowBalance(borrowBalance)
                setBorrowBalanceAmount(borrowBalanceAmount)

                updateDate({
                    supplyBalance: supplyBalance,
                    borrowBalance: borrowBalance,
                    borrowBalanceLimit: enterMarkets ? borrowBalanceLimit : 0,
                    exchangeRateMantissa: accountSnapshot[3],
                })
            }
        }, 3000)
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
        const borrowLimitAmount = new BigNumber(borrowLimit).minus(borrow).div(new BigNumber(tokenPrice).div(new BigNumber(10).pow(18)))
        console.log(
            "checkBorrowingLimit",
            supplyBalanceAmount,
            tokenPrice,
            borrowLimit,
            borrow,
            borrowLimitAmount.toString(),
        )
        if (new BigNumber(supplyBalanceAmount) >= borrowLimitAmount) {
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
        const value = lToken.name == "OKT" ? unFormatNumber(supplyValue, 18) : unFormatNumber(supplyValue, 10)
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
        const value = lToken.name == "OKT" ? unFormatNumber(supplyValue, 18) : unFormatNumber(supplyValue, 10)
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
        const value = lToken.name == "OKT" ? unFormatNumber(borrowValue, 18) : unFormatNumber(borrowValue, 10)
        await lTokenContract.methods.borrow(value).send({ from: account })
        setBorrowValue(0)
        closeFn()
        toast.dark("🚀 Borrow success!", toastConfig)
    }

    const repay = async () => {
        if (checkWallet()) return
        if (checkZero(borrowValue * 1)) return
        loading()
        const value = lToken.name == "OKT" ? unFormatNumber(borrowValue, 18) : unFormatNumber(borrowValue, 10)
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
                    <p>{lToken.name}<em>${formatNumber(tokenPrice, 18, 2)}</em></p>
                    <p className={styles.sub_title}>{lToken.description}</p>
                </span>
                <span>
                    <p>{formatAverageNumber(marketSize, 2)}</p>
                    <p className={styles.sub_titles}>Market Size</p>
                </span>
                <span>
                    <p>{formatAverageNumber(totalBorrow, 2)}</p>
                    <p className={styles.sub_titles}>Total Borrowed</p>
                </span>
                <span>
                    <p>
                        <b className={styles.green}>↑</b>
                        {formatThousandNumber(totalSupplyAPY, 2)}%
                    </p>
                    <p className={styles.sub_titles}>Deposit APY</p>
                </span>
                <span className={styles.border_right}>
                    <p>
                        {totalBorrowAPY > 0 ? <b className={styles.red}>↓</b> : <b className={styles.green}>↑</b>}
                        {formatThousandNumber(Math.abs(totalBorrowAPY), 2)}%
                    </p>
                    <p className={styles.sub_titles}>Borrow APY</p>
                </span>
                <span>
                    <h4>
                        <s>
                            {formatThousandNumber(supplyBalanceAmount, 2)}
                            <b>{lToken.name}</b>
                        </s>
                        <s>{formatUSDNmuber(supplyBalance, 2)}</s>
                    </h4>
                    <p className={styles.sub_titles}>Supply Balance</p>
                </span>
                <span>
                    <h4>
                        <s>
                            {formatThousandNumber(borrowBalanceAmount, 2)}
                            <b>{lToken.name}</b>
                        </s>
                        <s>{formatUSDNmuber(borrowBalance, 2)}</s>
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
                                    onChange={() => {
                                        !enterMarkets ? enterMarket() : exitMarket()
                                    }}
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
                                            if (checkWallet()) return
                                            if (switchSupply) {
                                                const value = lToken.name == "OKT" ? formatStringNumber(tokenBalance, 18) : formatStringNumber(tokenBalance, 10)
                                                setSupplyValue(value)
                                            } else {
                                                var value
                                                value = new BigNumber(borrowLimit).minus(borrow).div(new BigNumber(tokenPrice).div(new BigNumber(10).pow(18)))
                                                if (borrow == 0) {
                                                    value = supplyBalanceAmount
                                                }
                                                var supplyValues = parseFloat(value) > parseFloat(supplyBalanceAmount) ? supplyBalanceAmount : value
                                                supplyValues = lToken.name == "OKT" ? formatDecimals(value, 18) : formatDecimals(value, 10)
                                                console.log("supplyValues", supplyValues)
                                                setSupplyValue(supplyValues)
                                            }
                                        }}
                                    >
                                        {switchSupply ? "MAX" : "SAFE MAX(80%)"}
                                    </button>
                                </div>
                                <div className={styles.info}>
                                    <h1>Supply Rates</h1>
                                    <ul>
                                        <li>
                                            <p>
                                                <span>Supply APY</span>
                                                <span className={styles.num}>
                                                    <b className={styles.green}>↑</b>
                                                    {supplyApy}%
                                                </span>
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                <span>Distribution APY</span>
                                                <span className={styles.num}>
                                                    <b className={styles.green}>↑</b>
                                                    {supplyRewardAPY}%
                                                </span>
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
                                            supplyValue == 0 || parseFloat(supplyValue) > parseFloat(lToken.name == "OKT" ? formatStringNumber(tokenBalance, 18) : formatStringNumber(tokenBalance, 10))
                                        }
                                        className={styles.green}
                                        onClick={() => mint()}
                                    >
                                        {parseFloat(supplyValue) > parseFloat(lToken.name == "OKT" ? formatStringNumber(tokenBalance, 18) : formatStringNumber(tokenBalance, 10))
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
                                    {switchSupply && (lToken.name == "OKT" ? formatNumber(tokenBalance, 18, 8) : formatNumber(tokenBalance, 10, 8))}
                                    {!switchSupply && formatThousandNumber(supplyBalanceAmount, 8)} <b>{lToken.name}</b>
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
                                            if (checkWallet()) return
                                            if (switchBorrow) {
                                                var value = new BigNumber(borrowLimit)
                                                    .minus(borrow)
                                                    .div(new BigNumber(tokenPrice).div(new BigNumber(10).pow(18)))
                                                    .times(0.8)
                                                console.log("switchBorrow", new BigNumber(borrowLimit).minus(borrow).toString())
                                                value = lToken.name == "OKT" ? formatDecimals(value, 18) : formatDecimals(value, 10)
                                                setBorrowValue(value)
                                            } else {
                                                setBorrowValue(borrowBalanceAmount)
                                            }
                                        }}
                                    >
                                        {switchBorrow ? "SAFE MAX(80%)" : "MAX"}
                                    </button>
                                </div>
                                <div className={styles.info}>
                                    <h1>Borrow Rates</h1>
                                    <ul>
                                        <li>
                                            <p>
                                                <span>Borrow APY</span>
                                                <span className={styles.num}>
                                                    <b className={styles.red}>↓</b>
                                                    {borrowApy}%
                                                </span>
                                            </p>
                                        </li>
                                        <li>
                                            <p>
                                                <span>Distribution APY</span>
                                                <span className={styles.num}>
                                                    <b className={styles.green}>↑</b>
                                                    {borrowRewardAPY}%
                                                </span>
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
                                    {switchBorrow && formatThousandNumber(borrowBalanceAmount, 8)}
                                    {!switchBorrow && (lToken.name == "OKT" ? formatNumber(tokenBalance, 18, 8) : formatNumber(tokenBalance, 10, 8))} <b>{lToken.name}</b>
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
                        <h1>{formatUSDNmuber(borrow, 4)}</h1>
                        <p>Borrow Limit</p>
                    </span>
                    <span className={styles.item}>
                        <h1>{formatUSDNmuber(borrowLimit, 4)}</h1>
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
