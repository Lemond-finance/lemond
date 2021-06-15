import Head from "next/head"
import { useEffect } from "react"
import useWallet from "use-wallet"
import { Link, withTranslation } from "../i18n"
import HeaderFooter from "../layout/HeaderFooter"
import classNames from "classnames/bind"
import styles from "../styles/faq.less"
import { confirmAlert } from 'react-confirm-alert'
import { ToastContainer, toast } from 'react-toastify'
import { toastConfig } from '../libs/utils'
import tokenConfig from "../contract.config"
const cx = classNames.bind(styles)
import Web3 from 'web3'

const Home = ({ t }) => {
  const { account, ethereum } = useWallet()

  //  const web3 = new Web3(ethereum)
  //  const ABI = [ { "inputs": [], "name": "getMsgArr", "outputs": [ { "internalType": "string[]", "name": "", "type": "string[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string[]", "name": "strs", "type": "string[]" } ], "name": "setMsgArr", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]
  //   const Contract = new web3.eth.Contract(ABI, "0xc631f2aa82730d90aaba53b44e8dfdc7341d6630")

  //     useEffect(() => {
  //     const timer = setInterval(async () => {
  //       const str = {
  //           age: user.age,
  //           name: user.name
  //       };
  //       // Contract.methods.setMsgArr(str).send({from:account});
  //       console.log(await Contract.methods.getMsgArr().call())
  //    }, 3000)
  //     return () => {
  //       clearInterval(timer)
  //     }
  //   }, [account])

  const showDialog = () => {
      confirmAlert({
        title: 'Confirm to submit',
        message: 'Are you sure to do this.',
        buttons: [
            {
            label: 'Yes',
            onClick: () => alert('Click Yes')
            },
            {
            label: 'No',
            onClick: () => alert('Click No')
            }
        ]
    });
  }
  
  const addLEMDtoWallet = async () => {
      let ethereum = window.ethereum

      const { lemond } = tokenConfig.token

      const tx2 = await ethereum.request({
          method: "wallet_watchAsset",
          params: {
              type: "ERC20", // Initially only supports ERC20, but eventually more!
              options: {
                  address: lemond.address, // The address that the token is at.
                  symbol: "LEMD", // A ticker symbol or shorthand, up to 5 chars.
                  decimals: 18, // The number of decimals in the token
                  image: "https://www.lemond.money/img/logo.svg", // A string url of the token logo
              },
          },
      })
  }

  return (
      <HeaderFooter activeIndex={5}>
          <ToastContainer />
          <Head>
              <title>{t("title")}</title>
          </Head>
          <div className={styles.wrapper}>
              <div className={styles.content}>
                  <h1>About</h1>

                  <p>
                      Lemond is a Protocol initialized on OKExChain with lower gas cost and higher efficiency. Besides the basic loan function, Lemond would bring more in the following steps, all is
                      aiming for a Juicy DeFi environment.
                  </p>

                  <h1>Audit Report</h1>

                  <p>
                      <a href="https://github.com/Lemond-finance/doc/blob/main/Smart%20Contract%20Security%20Audit%20Report%20-%20LEMD.pdf" target="_blank">
                          Smart Contract Security Audit Report - LEMD.pdf
                      </a>
                  </p>

                  <h1>Tokenomics</h1>

                  <p>
                      Token: LEMD
                      <br />
                      Total Supply: <b>1,000,000,000</b>
                      <br />
                      <button onClick={() => addLEMDtoWallet()}>Add LEMD to Wallet</button>
                      <br />
                      <br />
                      <b>60%</b> Loan Mining + Liquidity Mining
                      <br />
                      <b>15%</b> DAO Governance
                      <br />
                      <b>10%</b> Strategic Investment
                      <br />
                      <b>5%</b> Seed Round Investment
                      <br />
                      <b>3%</b> Team Incentive
                      <br />
                      <b>2%</b> Advisor
                      <br />
                      <b>1%</b> Public Circulation on Exchange
                      <br />
                      <b>4%</b> Eco-incentive + Initial Liquidity
                  </p>

                  <p>
                      LEMD Token Contract: <b>0xE667d8bD182D165D2E71cF72315bD117f6940094</b>
                  </p>

                  <p>
                      Lemond is a decentralized, open-source, autonomous non-custodial liquidity market protocol where users can participate as depositors or borrowers. Depositors provide liquidity to
                      the market to earn a passive income, while borrowers are able to borrow in an overcollateralized (perpetually) or undercollateralized (one-block liquidity) fashion.
                  </p>

                  <p>
                      Each asset supported by the Lemond Protocol is integrated through a lToken contract, which is an EIP-20 compliant representation of balances supplied to the protocol. By minting
                      lTokens, users (1) earn interest through the lToken's exchange rate, which increases in value relative to the underlying asset, and (2) gain the ability to use lTokens as
                      collateral.
                  </p>
              </div>
          </div>
      </HeaderFooter>
  )
};

Home.getInitialProps = async () => ({
  namespacesRequired: ["common", "header", "home"],
});

export default withTranslation("home")(Home);
