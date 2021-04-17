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
            address: "0x09D91ADb1a08293407573e05b9B81601674d0f77",
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
                address: "0xF10d3a5f490b041F43D2028B566359ABdDE105d6",
                abi: require("./abi/LEther.json"),
                className: "okb",
                name: "OKT",
                description: "OKExChain Token",
            },
            lOKB: {
                address: "0x5655CcDF552b72D867277084314E26fa08AF7fd2",
                abi: require("./abi/LERC20.json"),
                className: "okb",
                name: "OKB",
                description: "OKEx Token",
            },
            lUSDT: {
                address: "0xEc786Dd05C09c3f5e01ec62fD2E0AeA9368Aab65",
                abi: require("./abi/LERC20.json"),
                className: "usdt",
                name: "USDT",
                description: "Tether USD",
            },
            lETHK: {
                address: "0x7823Cb29c11709813638ae8Df4d99102581B3b21",
                abi: require("./abi/LERC20.json"),
                className: "eth",
                name: "ETH",
                description: "Ethereum",
            },
            lBTCK: {
                address: "0x880564eB621BF3f52fC8E81640c88E5aD51335E5",
                abi: require("./abi/LERC20.json"),
                className: "btc",
                name: "BTC",
                description: "BitCoin",
            },
        },
        controller: {
            lemdBreeder: {
                address: "0x4b47b3A3755601778Ac3Cf3f8f6973ed122770ea",
                abi: require("./abi/LemdBreeder.json"),
            },
            lemdDistribution: {
                address: "0xc35db2D4e76A467977dD6CDa63290b7105D3C3D4",
                abi: require("./abi/LemdDistribution.json"),
            },
            priceOracle: {
                address: "0xb64050883B3Dc0Ea657859D3cA86BFe6419e89d1",
                abi: require("./abi/SimplePriceOracle.json"),
            },
            comptroller: {
                address: "0xa7C641261c27c73848Ab0055A0d32D7304647137",
                abi: require("./abi/Comptroller.json"),
            },
            jumpRateModel: {
                address: "0x8FF6B8b87E59D338865F1419f0d6110d22d51eB9",
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
