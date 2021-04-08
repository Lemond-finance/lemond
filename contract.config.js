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
                address: "0x09973e7e3914EB5BA69C7c025F30ab9446e3e4e0",
                abi: require("./tokenAbi/BTCK.json"),
            },
        },
        lTokens: {
            lEther: {
                address: "0xd5ef09E50d38E1a427a057830Bf5D7A0304a2FD7",
                abi: require("./abi/LEther.json"),
            },
            lOKB: {
                address: "0x28771205292Bf4B1dAcA7efFA49092eb34cAE104",
                abi: require("./abi/LERC20.json"),
            },
            lETHK: {
                address: "0xd7Bf65e8a6e4601a9f8475A320Cde428eAF65e1A",
                abi: require("./abi/LERC20.json"),
            },
            lUSDT: {
                address: "0x7e2bbb9944985f1E94d7B657C845A76BB52D67B0",
                abi: require("./abi/LERC20.json"),
            },
            lBTCK: {
                address: "0x0E6e1086e46a5C5Cc29C6F50692b504B923DCf83",
                abi: require("./abi/LERC20.json"),
            },
        },
        controller: {
            lemdBreeder: {
                address: "0x530124EB1a144E47620056816598eA3Cc0778489",
                abi: require("./abi/LemdBreeder.json"),
            },
            lemdDistribution: {
                address: "0xc893F17BE5b3Ac3EbCA86073007439196F59E567",
                abi: require("./abi/LemdDistribution.json"),
            },
            priceOracle: {
                address: "0xBEe5fAFf5B5F1E13aa640bEa4fEA1C4F27752310",
                abi: require("./abi/SimplePriceOracle.json"),
            },
            comptroller: {
                address: "0xB862D3d472fD427f4D9E2424C272c5425546f1C3",
                abi: require("./abi/Comptroller.json"),
            },
            jumpRateModel: {
                address: "0xE091Ac3033F4f12B5B097a6679D2C4BB80ee07e8",
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
