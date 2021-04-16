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
            address: "0x8A5A153E8dE5Ca850bd9E006c533898F4FfB8982",
            abi: require("./abi/LEMD.json"),
        },
    },
    lend: {
        tokens: {
            OKT: {
                address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                abi: require("./tokenAbi/OKB.json"),
            },
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
                address: "0xc63fc48Ec02CB504f1c6C9095EaaeB97cBF54Bfe",
                abi: require("./abi/LEther.json"),
                className: "okb",
                name: "OKT",
                description: "OKExChain Token",
            },
            lOKB: {
                address: "0xC31cA7E4D0985F800Ef093502d0bc7153162fEBC",
                abi: require("./abi/LERC20.json"),
                className: "okb",
                name: "OKB",
                description: "OKEx Token",
            },
            lUSDT: {
                address: "0x3C1FDD2b88ab6381B4DCd75f20B7FcD5F2615194",
                abi: require("./abi/LERC20.json"),
                className: "usdt",
                name: "USDT",
                description: "Tether USD",
            },
            lETHK: {
                address: "0x55d98614042cc8eAB90843c557D1489123e42ece",
                abi: require("./abi/LERC20.json"),
                className: "eth",
                name: "ETH",
                description: "Ethereum",
            },
            lBTCK: {
                address: "0x9deb4a7b52dB1333700C22D37535a14eeDcdc6F2",
                abi: require("./abi/LERC20.json"),
                className: "btc",
                name: "BTC",
                description: "BitCoin",
            },
        },
        controller: {
            lemdBreeder: {
                address: "0xD1bEC7b8db28A7075b328494732370fE8c11883A",
                abi: require("./abi/LemdBreeder.json"),
            },
            lemdDistribution: {
                address: "0x6743867f6dBdA64020a5ad56Cd458A6d37233700",
                abi: require("./abi/LemdDistribution.json"),
            },
            priceOracle: {
                address: "0xC860ffb94d5ed9BAec8E784114609f044f461913",
                abi: require("./abi/SimplePriceOracle.json"),
            },
            comptroller: {
                address: "0xC4488577DEec9e3018395079cEa863DB34b2cbce",
                abi: require("./abi/Comptroller.json"),
            },
            jumpRateModel: {
                address: "0x9d10A02C91A8Ba0D0f856bC4C64D3d4a752Bcc92",
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
