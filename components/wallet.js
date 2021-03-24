import { Component, useEffect, useState } from 'react';
import { utils as ethersUtils } from 'ethers'
import { ConnectionRejectedError, UseWalletProvider, useWallet } from 'use-wallet'
import { withTranslation } from '../i18n'
import classNames from 'classnames/bind';
import styles from '../styles/wallet.less'
import metamaskIcon from '../public/img/metamask.svg'
import walletconnectIcon from '../public/img/walletconnect.svg'
import ontoIcon from '../public/img/onto.svg'
import ontoBG from '../public/img/onto_bg.png'
import '../styles/react-confirm-alert.less'
import { confirmAlert } from 'react-confirm-alert'
import tokenConfig from '../contract.config.js'
import Web3,{utils} from 'web3'

const cx = classNames.bind(styles);

const WalletMask = (props) => {
    const [isHideWallet, setIsHideWallet] = useState(true)
    const showWallet = (show) => setIsHideWallet(show) 
    const { connectWallet } = props
    const { t } = props

    return (<>
        <button className={styles.button} onClick={() => showWallet(false)}>{t('connect-wallet')}</button>
        <div onClick={() => showWallet(true)} className={cx(styles.walletMask, { hide: isHideWallet })} >
            <ul className={styles.walletDialog}>
                <li onClick={() => connectWallet()}>
                    <div className={styles.walletWrapper}>
                        <img src={metamaskIcon} className={styles.walletIcon} />
                        <div className={styles.walletTitle}>MetaMask</div>
                        <div className={styles.walletTips}>{t('connect-metamask')}</div>
                    </div>
                </li>
                <li onClick={() => connectWallet()}>
                    <div className={styles.walletWrapper}>
                        <img src={ontoIcon} className={styles.walletIcon} />
                        <div className={styles.walletTitle}>ONTO Wallet</div>
                        <div className={styles.walletTips}>{t('connect-ontoconnect')}</div>
                    </div>
                </li>
            </ul>
        </div>
    </>)
}

const Wallet = ({t}) => {
    const wallet = useWallet()
    const { account, ethereum } = wallet
    const blockNumber = wallet.getBlockNumber()
    const [showBox,setShowBox] = useState(false)

    const web3 = new Web3(ethereum)
    const ontoAirdropConfig = tokenConfig.airdrop.onto
    const ontoAirdropContract = new web3.eth.Contract(
        ontoAirdropConfig.abi,
        ontoAirdropConfig.address
    )

    const activate = connector => {
        const appVersion = navigator.appVersion
        if(appVersion.indexOf("Chrome") != -1){
            // localStorage.setItem("alreadyGot","true")
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className={styles.confirmAlert}>
                            <img width="400" src={ontoBG} />
                             <p className={styles.center}>
                                  <button onClick={()=>{
                                        onClose()
                                        setShowBox(true)
                                    }}> OK </button>
                              </p>
                        </div>
                    )
                }
            })
            wallet.connect(connector)
            return
        }
        else{
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className={styles.confirmAlert}>
                            <h1>Please use ONTO wallet to connect.</h1>
                            <p className={styles.center}>
                                <button onClick={onClose}> OK </button>
                            </p>
                        </div>
                    )
                }
            })
            return
        }
        wallet.connect(connector)
    }

    const formatAddress = (address) => { 
        return address.substr(0, 4) + '...' + address.substr(address.length - 4, 4) 
    }

    const getOntoReward = async() => {
          if(localStorage.getItem("alreadyGot") == "true"){
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className={styles.confirmAlert}>
                            <h1>Already got reward.</h1>
                            <p className={styles.center}>
                                <button onClick={onClose}> OK </button>
                            </p>
                        </div>
                    )
                }
            })
            return
        }
        const auth = utils.keccak256(account)
        console.log(auth)
        await ontoAirdropContract.methods.unpack(auth).send({ from: account })
        localStorage.setItem("alreadyGot","true")
    }

    return <div className={styles.wallet}>

        {!!showBox && <div onClick={()=>getOntoReward()} className={styles.box}></div>}

        {wallet.account && (<span className={styles.account}>{formatAddress(wallet.account)}</span>)}

        {wallet.account && (
            <span className={styles.balance}> {wallet.balance === '-1' ? '...' : `${parseFloat(ethersUtils.formatEther(wallet.balance)).toFixed(2)} OKT`} </span>
        )}

        {(() => {
            if (wallet.error?.name) {
                return (
                        // <span>
                        //     {wallet.error instanceof ConnectionRejectedError
                        //         ? 'Connection error: the user rejected the activation'
                        //         : wallet.error.name}
                        // </span>
                        <button className={styles.button} onClick={wallet.reset()}>{t('connect-retry')}</button>
                )
            }

            if (wallet.status === 'connecting') {
                return (
                        <button className={styles.button} onClick={() => wallet.reset()}>{t('connect-cancel')}</button>
                )
            }

            if (wallet.status === 'connected') {
                return (
                        <button className={styles.button} onClick={() => wallet.reset()}>{t('connect-disconnect')}</button>
                )
            }

            return (
                <div>
                    <WalletMask connectWallet={(type) => activate(type)} t={t}/>
                </div>
            )
        })()}


        {/* {wallet.account && (
            <p>
                <span>Block:</span> <span>{blockNumber || '…'}</span>
            </p>
        )} */}
    </div>
}

export default withTranslation('header')(Wallet)