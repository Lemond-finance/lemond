import "../styles/_common.less"
import styles from "../styles/layout.less"
import { withTranslation } from "../i18n"
import Head from "next/head"
import Header from "./Header"
import Footer from "./Footer"
import React, { useState, useEffect } from 'react'
import { findDOMNode } from 'react-dom'
import LoadingBar from 'react-top-loading-bar'

const HeaderFooter = (props) => {

  const { activeIndex } = props
  const [progress, setProgress] = useState(0)

  return (
      <div className={styles.wrapper}>
        <LoadingBar color='#F5BA5D' progress={progress} onLoaderFinished={() => setProgress(0)}/>
        <Head>
          <meta itemProp="image" content="/logo.png" />
          <meta charSet="utf-8" />
          <meta name="renderer" content="webkit" />
          <meta name="author" content="Teamoe" />
          <meta name="generator" content="Teamoe" />
          <meta name="copyright" content="lemond.money" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          <meta httpEquiv="Cache-Control" content="no-transform" />
          <meta httpEquiv="Cache-Control" content="no-siteapp" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="bookmark" href="/favicon.ico" />
          <meta name="description" content="lemond.money" />
          <meta name="keywords" content="lemond.money" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
          <link rel="stylesheet" href="/ReactToastify.css" />
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-0JVC00MHTC"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                 window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-0JVC00MHTC');
              `,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(d) {
                  var config = {
                    kitId: 'gfy2wyg',
                    scriptTimeout: 3000,
                    async: true
                  },
                  h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
                })(document);
              `,
            }}
          />
        </Head>
        <Header activeIndex={activeIndex} />
        <main className={styles.container}>{props.children}</main>
        <Footer />
      </div>
  );
};

export default withTranslation("header")(HeaderFooter);
