import Head from "next/head";
import React, { useState, useEffect } from "react";
import { render } from 'react-dom';
import useWallet from "use-wallet";
import { Link, withTranslation } from "../i18n";
import HeaderFooter from "../layout/HeaderFooter";
import classNames from "classnames/bind";
import styles from "../styles/home.less";
const cx = classNames.bind(styles);
import Web3 from 'web3';
import CountUp from 'react-countup';
 
const Home = ({ t }) => {
  const { account, ethereum } = useWallet();
  const [count, setCount] = useState(0);
  const handleScroll = () => {setCount(count+1);};


  useEffect(()=>{
    // create
        window.addEventListener('scroll',handleScroll);
    return ()=>{
    // destroy
        window.removeEventListener('scroll',handleScroll);
    }
    // deps
    },[count]);
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
  
  return (
    <HeaderFooter activeIndex={1}>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.bg_cute}>
          <div className={styles.bg_box}></div>
        </div>
        <div className={styles.slogan}>
            <h1></h1>
            <h2>A <b>Juicy DeFi</b> Protocol</h2>
            <h4 id="count"><CountUp start={0} end={5270319549.94} separator=","  decimal="."  decimal="," prefix="$"/></h4>
            <p><b>Lemond</b> is a decentralized, open-source, autonomous, non-custodial liquidity market protocol where users can participate as depositors or borrowers.</p>
            <p><Link href="/lend"><button>Get App</button></Link></p>
          </div>
          <div className={styles.airdrop}>
            <div className={styles.airdrop_box}></div>
            <h1><i></i><span>Lemond AirDrop</span></h1>
            <h2>Lemond Airdrop</h2>
            <p>Besides <b>OKExChain</b> testing bounty. <b>Lemond</b> is also holding Airdrop Carnival to get your bag served.</p>
            <p>Massive <b>$LEMD</b> in the box!</p>
            <p>Suit up for our Juicy Candies.</p>
            <p className={styles.btns}>Episode ① <Link href="/farm"><button>Get Airdrop >></button></Link> </p>
            <p className={styles.btns}>Episode ② <button disabled>Comming soon</button> </p>
            <p className={styles.btns}>Episode ③ <button disabled>Comming soon</button> </p>
          </div>
      </div>

      <script>
        console.log(${count});
      </script>
    </HeaderFooter>
  )
};

Home.getInitialProps = async () => ({
  namespacesRequired: ["common", "header", "home"],
});


export default withTranslation("home")(Home);
