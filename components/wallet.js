import { Component, useEffect, useState } from 'react';
import { utils as ethersUtils } from 'ethers'
import { ConnectionRejectedError, UseWalletProvider, useWallet } from 'use-wallet'
import { withTranslation } from '../i18n'
import classNames from 'classnames/bind';
import styles from '../styles/wallet.less'
import metamaskIcon from '../public/img/metamask.svg'
import walletconnectIcon from '../public/img/walletconnect.svg'

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
                {/* <li onClick={() => connectWallet('walletconnect')}>
                    <div className={styles.walletWrapper}>
                        <img src={walletconnectIcon} className={styles.walletIcon} />
                        <div className={styles.walletTitle}>WalletConnect</div>
                        <div className={styles.walletTips}>{t('connect-walletconnect')}</div>
                    </div>
                </li> */}
            </ul>
        </div>
    </>)
}

const Wallet = ({t}) => {
    const wallet = useWallet()
    const blockNumber = wallet.getBlockNumber()
    const activate = connector => wallet.connect(connector)
    const formatAddress = (address) => { 
        return address.substr(0, 4) + '...' + address.substr(address.length - 4, 4) 
    }

    return <div className={styles.wallet}>

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