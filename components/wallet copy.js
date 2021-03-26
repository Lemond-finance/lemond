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
                <li onClick={() => connectWallet('onto')}>
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
    const [ontoIcon,setOntoIcon] = useState(false)
    const [ontoAccount,setOntoAccount] = useState("")

    const activate = connector => {
        const appVersion = navigator.appVersion
        if( connector == "onto"){
            if(appVersion.indexOf("Mobile") != -1){
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

                const ethereum = window.ethereum
                const web3js = new Web3(ethereum);
                ethereum.enable()
                console.log(web3js.eth.accounts[0])
                setOntoAccount(web3js.eth.accounts[0])
                web3js.eth.defaultAccount = web3js.eth.accounts[0];
                const ontoAirdropConfig = tokenConfig.airdrop.onto
                window.ontoAirdropContract = web3js.eth.contract(ontoAirdropConfig.abi).at("29cc41e332468b0d8a4a06be07fdb4dd2400c0dd")
                console.log(window.ontoAirdropContract)
                setOntoIcon(true)
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
        }
        else{
            wallet.connect(connector)
        }
    }

    const formatAddress = (address) => { 
        return address.substr(0, 4) + '...' + address.substr(address.length - 4, 4) 
    }

    const getOntoReward = async(ontoAirdropContract) => {
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
        // const auth = ethersUtils.keccak256(ontoAccount)
        // console.log(auth)
        window.ontoAirdropContract.unpack(ontoAccount,(err, result)=>{
            console.log(err,result)
            if(result){
                localStorage.setItem("alreadyGot","true")
            }
        })
    }

    return <div className={styles.wallet}>

        {!!showBox && <div onClick={()=>getOntoReward()} className={styles.box}></div>}

        {wallet.account && (<span className={styles.account}>{formatAddress(wallet.account)}</span>)}

        {ontoAccount && (<>
        
            <span className={styles.account}>{formatAddress(ontoAccount)}</span>
            <button className={cx(styles.button, { onto: !!ontoIcon })} onClick={wallet.reset()}>{t('connect-disconnect')}</button>
        
        </>)}

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
                        <button className={cx(styles.button, { onto: !!ontoIcon })} onClick={wallet.reset()}>{t('connect-retry')}</button>
                )
            }

            if (wallet.status === 'connecting') {
                return (
                        <button className={cx(styles.button, { onto: !!ontoIcon })} onClick={() => wallet.reset()}>{t('connect-cancel')}</button>
                )
            }

            if (wallet.status === 'connected') {
                return (
                        <button className={cx(styles.button, { onto: !!ontoIcon })} onClick={() => wallet.reset()}>{t('connect-disconnect')}</button>
                )
            }

            return (
                <div>
                    {!ontoAccount && <WalletMask connectWallet={(type) => activate(type)} t={t}/>}
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