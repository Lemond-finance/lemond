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
            address: "0xf6244f959E771eb1295c228E3348c420534F26f2",
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
                address: "0x34F2C9622fF5E41d0731eD48DeAdbbeF6fac75e4",
                abi: require("./abi/LEther.json"),
                className: "okb",
                name: "OKT",
                description: "OKExChain Token",
            },
            lOKB: {
                address: "0xe78ec897358a8c97409C4901f51782D8c350b4A3",
                abi: require("./abi/LERC20.json"),
                className: "okb",
                name: "OKB",
                description: "OKEx Token",
            },
            lUSDT: {
                address: "0x354D757f36EE55e5a1abb66069e3a183c904c9C1",
                abi: require("./abi/LERC20.json"),
                className: "usdt",
                name: "USDT",
                description: "Tether USD",
            },
            lETHK: {
                address: "0x28eb130E0d43906E2B235478dA70990D6c110EA6",
                abi: require("./abi/LERC20.json"),
                className: "eth",
                name: "ETH",
                description: "Ethereum",
            },
            lBTCK: {
                address: "0x97aaBF77E5a75AC3d9B351Ce7a0aBEE031898DC8",
                abi: require("./abi/LERC20.json"),
                className: "btc",
                name: "BTC",
                description: "BitCoin",
            },
        },
        controller: {
            lemdBreeder: {
                address: "0xc0e7B5dADe653F7B466CD88C964F1080670E51ed",
                abi: require("./abi/LemdBreeder.json"),
            },
            lemdDistribution: {
                address: "0xDa755D8cAfc0e731245415d3da9748EB92D87CaC",
                abi: require("./abi/LemdDistribution.json"),
            },
            priceOracle: {
                address: "0x728E7A985D3ae9CC476AFC394Ab6660c0727c4Bc",
                abi: require("./abi/SimplePriceOracle.json"),
            },
            comptroller: {
                address: "0xbA4A992ea4E301107f996c2eb93d5d1876670112",
                abi: require("./abi/Comptroller.json"),
            },
            jumpRateModel: {
                address: "0x36b07E735DC6536DfdA597d143f44F44dD42d15F",
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
