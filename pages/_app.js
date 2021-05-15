import App from 'next/app'
import { appWithTranslation } from '../i18n'
import { UseWalletProvider } from 'use-wallet'

const MyApp = ({ Component, pageProps }) => (
    <UseWalletProvider
        chainId={0x41}
        connectors={{
            walletconnect: { rpcUrl: "https://exchaintestrpc.okex.org" },
        }}
    >
        <Component {...pageProps} />
    </UseWalletProvider>
)

MyApp.getInitialProps = async (appContext) => ({ ...await App.getInitialProps(appContext) })

export default appWithTranslation(MyApp)
