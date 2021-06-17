import { Component, useEffect, useState } from 'react';
import { ethers,utils as ethersUtils } from 'ethers'
import { ConnectionRejectedError, UseWalletProvider, useWallet } from 'use-wallet'
import { withTranslation } from '../i18n'
import classNames from 'classnames/bind';
import styles from '../styles/wallet.less'
import metamaskIcon from '../public/img/metamask.svg'
import walletconnectIcon from '../public/img/walletconnect.svg'
import ontoIcons from '../public/img/onto.svg'
import ontoBG from '../public/img/onto_end_bg.png'
import tpIcons from '../public/img/tp_icon.png'
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
                <li onClick={() => connectWallet('tp')}>
                    <div className={styles.walletWrapper}>
                        <img src={tpIcons} className={styles.walletIcon} />
                        <div className={styles.walletTitle}>TokenPocket Wallet</div>
                        <div className={styles.walletTips}>{t('connect-tpconnect')}</div>
                    </div>
                </li>
                <li onClick={() => connectWallet('onto')}>
                    <div className={styles.walletWrapper}>
                        <img src={ontoIcons} className={styles.walletIcon} />
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
    const [ontoIcon, setOntoIcon] = useState(false)
    const [tpIcon, setTpIcon] = useState(false)

    const activate = async connector => {
        setOntoIcon(false)
        if( connector == "onto"){
            confirmAlert({
                    closeOnClickOutside: false,
                    customUI: ({ onClose }) => {
                        return (
                            <div className={styles.confirmAlert}>
                                <img width="400" src={ontoBG} />
                                <p className={styles.center}>
                                    <button onClick={onClose}> OK </button>
                                </p>
                            </div>
                        )
                    }
            })
            setOntoIcon(true)
            wallet.connect()
        }
        else if(connector == "tp"){
            setTpIcon(true)
            wallet.connect()
        }
        else{
            wallet.connect(connector)
        }
    }

    const formatAddress = (address) => { 
        return address.substr(0, 4) + '...' + address.substr(address.length - 4, 4) 
    }

    return <div className={styles.wallet}>

        {wallet.account && (<span className={styles.account}>{formatAddress(wallet.account)}</span>)}

        {wallet.account && (
            <span className={styles.balance}> {wallet.balance === '-1' ? '...' : `${parseFloat(ethersUtils.formatEther(wallet.balance)).toFixed(2)} BNB`} </span>
        )}

        {(() => {
            if (wallet.error?.name) {
                return (
                    <button className={cx(styles.button, { onto: !!ontoIcon }, { tp: !!tpIcon })} onClick={wallet.reset()}>{t('connect-retry')}</button>
                )
            }

            if (wallet.status === 'connecting') {
                return (
                        <button className={cx(styles.button, { onto: !!ontoIcon }, { tp: !!tpIcon })} onClick={() => wallet.reset()}>{t('connect-cancel')}</button>
                )
            }

            if (wallet.status === 'connected') {
                return (
                        <button className={cx(styles.button, { onto: !!ontoIcon }, { tp: !!tpIcon })} onClick={() => wallet.reset()}>{t('connect-disconnect')}</button>
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