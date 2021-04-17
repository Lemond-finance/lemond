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
            address: "0x1d58D84fBAC3e2C665d281F8bc25DF0505A7993f",
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
                address: "0xe90da92488080cD47cf27A1e7AA7f8B3D3D99518",
                abi: require("./abi/LEther.json"),
                className: "okb",
                name: "OKT",
                description: "OKExChain Token",
            },
            lOKB: {
                address: "0xDA092ea1135589AF7C0eEEe2Df8C18880962b940",
                abi: require("./abi/LERC20.json"),
                className: "okb",
                name: "OKB",
                description: "OKEx Token",
            },
            lUSDT: {
                address: "0x9698842432f0fB5Adf236CFb11A8439E4DACF8b5",
                abi: require("./abi/LERC20.json"),
                className: "usdt",
                name: "USDT",
                description: "Tether USD",
            },
            lETHK: {
                address: "0x020EBb2A1C0F4687b4BAF0DDC5Ad7f6655585993",
                abi: require("./abi/LERC20.json"),
                className: "eth",
                name: "ETH",
                description: "Ethereum",
            },
            lBTCK: {
                address: "0xDB4A990520cD422A621D00D4D473fEd63503324B",
                abi: require("./abi/LERC20.json"),
                className: "btc",
                name: "BTC",
                description: "BitCoin",
            },
        },
        controller: {
            lemdBreeder: {
                address: "0xA3Ae681f046178c6A8D77D28Cc475b237E74B116",
                abi: require("./abi/LemdBreeder.json"),
            },
            lemdDistribution: {
                address: "0x3786686C97F6EBC2E008607a578c1be29f9d1e3E",
                abi: require("./abi/LemdDistribution.json"),
            },
            priceOracle: {
                address: "0x26cda91358aC555f404C015d060195C7046fe4ed",
                abi: require("./abi/SimplePriceOracle.json"),
            },
            comptroller: {
                address: "0xCFA272e12ef5F32DC557894f1cA9F155D6CD81BE",
                abi: require("./abi/Comptroller.json"),
            },
            jumpRateModel: {
                address: "0xe0978567Dbe93241e0b5ef63dEB630E1bC867564",
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
