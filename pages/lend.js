import Head from "next/head"
import { useEffect } from "react"
import useWallet from "use-wallet"
import { Link, withTranslation } from "../i18n"
import HeaderFooter from "../layout/HeaderFooter"
import classNames from "classnames/bind"
import styles from "../styles/lend.less"
import { confirmAlert } from 'react-confirm-alert'
import { ToastContainer, toast } from 'react-toastify'
import { toastConfig } from '../libs/utils'
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

  const showAlert = () => {
      toast.dark('🚀 Waiting for open!', toastConfig)
  }

  return (
    <HeaderFooter  activeIndex={2}>
      <ToastContainer />
      <Head>
        <title>{t('title')}</title>
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.lend_total}>
            <h1></h1>
            <h2>Current market size</h2>
            <h3>$ 5,270,319,549.94</h3>
        </div>
        <ul className={styles.lend_list}>
            <li className={styles.okb}>
                <span className={styles.icon}></span>
                <span className={styles.left}>
                    <p>#OKB</p>
                    <p className={styles.sub_title}>OKB</p>
                </span>
                <span>
                    <p>$0M</p>
                    <p className={styles.sub_titles}>Market size</p>
                </span>
                <span>
                    <p>$0M</p>
                    <p className={styles.sub_titles}>Total borrowed</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Deposit APY</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Borrow APY</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Distribution APY</p>
                </span>
                <span className={styles.none} >
                    <button  onClick={()=>showAlert()}>Deposit / Borrow</button>
                </span>
            </li>
            <li className={styles.usdt}>
                <span className={styles.icon}></span>
                <span className={styles.left}>
                    <p>#Tether</p>
                    <p className={styles.sub_title}>USTD</p>
                </span>
                <span>
                    <p>$0M</p>
                    <p className={styles.sub_titles}>Market size</p>
                </span>
                <span>
                    <p>$0M</p>
                    <p className={styles.sub_titles}>Total borrowed</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Deposit APY</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Borrow APY</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Distribution APY</p>
                </span>
                <span className={styles.none}>
                    <button onClick={()=>showAlert()}>Deposit / Borrow</button>
                </span>
            </li>
            <li className={styles.btc}>
                <span className={styles.icon}></span>
                <span className={styles.left}>
                    <p>#BitCoin</p>
                    <p className={styles.sub_title}>BTC</p>
                </span>
                <span>
                    <p>$0M</p>
                    <p className={styles.sub_titles}>Market size</p>
                </span>
                <span>
                    <p>$0M</p>
                    <p className={styles.sub_titles}>Total borrowed</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Deposit APY</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Borrow APY</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Distribution APY</p>
                </span>
                <span className={styles.none}>
                    <button  onClick={()=>showAlert()}>Deposit / Borrow</button>
                </span>
            </li>
            <li className={styles.eth}>
                <span className={styles.icon}></span>
                <span className={styles.left}>
                    <p>#Ethereum</p>
                    <p className={styles.sub_title}>ETH</p>
                </span>
                <span>
                    <p>$0M</p>
                    <p className={styles.sub_titles}>Market size</p>
                </span>
                <span>
                    <p>$0M</p>
                    <p className={styles.sub_titles}>Total borrowed</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Deposit APY</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Borrow APY</p>
                </span>
                <span>
                    <p>0%</p>
                    <p className={styles.sub_titles}>Distribution APY</p>
                </span>
                <span className={styles.none}>
                    <button  onClick={()=>showAlert()}>Deposit / Borrow</button>
                </span>
            </li>
            
        </ul>
      </div>
    </HeaderFooter>
  )
};

Home.getInitialProps = async () => ({
  namespacesRequired: ["common", "header", "home"],
});

export default withTranslation("home")(Home);
