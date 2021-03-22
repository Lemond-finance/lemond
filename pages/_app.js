import App from 'next/app'
import { appWithTranslation } from '../i18n'
import { UseWalletProvider } from 'use-wallet'

const MyApp = ({ Component, pageProps }) => <UseWalletProvider
    chainId={65}
    connectors={{
        walletconnect: { rpcUrl: 'http://okexchaintest.okexcn.com:26659' }
    }}
><Component {...pageProps} /></UseWalletProvider>

MyApp.getInitialProps = async (appContext) => ({ ...await App.getInitialProps(appContext) })

export default appWithTranslation(MyApp)
