module.exports = {
    stake: {
        okt: {
            name: "LEMD Genesis Pool",
            description: "Get OKT Token",
            icon: "icon_domo_eth",
            link: "https://gitter.im/okexchain-testnet/faucet",
            address: "0x2c91AA5F6586e9E13D4EC50dA16b336beC448BCf",
            abi: require("./abi/OKTPool.json"),
            speed: "Genesis",
        },
    },
    token: {
        lemond: {
            // address: "0xE667d8bD182D165D2E71cF72315bD117f6940094",
            address: "0x4d80d22f8C422CEdaf833b92Ca0AF627c6839067",
            abi: require("./abi/LEMD.json"),
        },
    },
    lend: {
        tokens: {
            OKB: {
                address: "0xDa9d14072Ef2262c64240Da3A93fea2279253611",
                abi: require("./tokenAbi/OKB.json"),
            },
            USDT: {
                address: "0xe579156f9dEcc4134B5E3A30a24Ac46BB8B01281",
                abi: require("./tokenAbi/USDT.json"),
            },
            ETHK: {
                address: "0xDF950cEcF33E64176ada5dD733E170a56d11478E",
                abi: require("./tokenAbi/ETHK.json"),
            },
            BTCK: {
                address: "0x0264C66994CA9749b59170972f50A33c128d9647",
                abi: require("./tokenAbi/BTCK.json"),
            },
        },
        lTokens: {
            lEther: {
                address: "0x6818a19543e6c164B4861cdD918630a0beB3f7dD",
                abi: require("./abi/LEther.json"),
            },
            lOKB: {
                address: "0xED477f6fc11d3e6C5481cf777c2D85b9db35aD6A",
                abi: require("./abi/LERC20.json"),
            },
            lETHK: {
                address: "0x4933391309CDD33616b8fD2F2db3cB17fb26ADcf",
                abi: require("./abi/LERC20.json"),
            },
            lUSDT: {
                address: "0x845ded93694E6C72EBB3dAEA615b325069DdF37c",
                abi: require("./abi/LERC20.json"),
            },
            lBTCK: {
                address: "0x0264C66994CA9749b59170972f50A33c128d9647",
                abi: require("./abi/LERC20.json"),
            },
        },
        controller: {
            lemdBreeder: {
                address: "0x5ee75EE3D2d7ACb449eaCC555a383E6BFD4E0366",
                abi: require("./abi/LemdBreeder.json"),
            },
            lemdDistribution: {
                address: "0x51C8Bd17F1E493EED4A14DCA415C2f65E025Fc93",
                abi: require("./abi/LemdDistribution.json"),
            },
            priceOracle: {
                address: "0x700f7dF22cC0Bb8cEcC0784085d7575BF04878B8",
                abi: require("./abi/SimplePriceOracle.json"),
            },
            comptroller: {
                address: "0x6236EE4092d1DfA8212605CfB46bFCB07591ab38",
                abi: require("./abi/Comptroller.json"),
            },
            jumpRateModel: {
                address: "0xD42bdCD9F082B4543135D5F27F7b4Ac3788bd168",
                abi: require("./abi/JumpRateModel.json"),
            },
        },
    },
    pool: {
        okt_pool: {
            address: "0x6eF0adF5dB077FE8A69f94D25e4EF29a0726e779",
            abi: require("./abi/OKTPool.json"),
        },
    },
    airdrop: {
        onto: {
            address: "0xDb63743aC2fc520217C2ef99F282163bfDcA70bf",
            abi: require("./abi/ONOTAirdrop.json"),
        },
    },
}
