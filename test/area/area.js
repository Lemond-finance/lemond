const { expect } = require('chai')
const hre = require('hardhat')

describe('Area', function () {

    it("Should return the new greeting once it's changed", async function () {

        // 逻辑层
        const AreaLogic = await hre.ethers.getContractFactory('AreaLogic')
        const areaLogic = await AreaLogic.deploy()
        await areaLogic.deployed()
        console.log('AreaLogic deployed to:', areaLogic.address)

        // 代理层
        const AreaProxy = await hre.ethers.getContractFactory('AreaProxy')
        const areaProxy = await AreaProxy.deploy()
        await areaProxy.deployed()
        areaProxy.setContractAddr(areaLogic.address)
        console.log('AreaProxy deployed to:', areaProxy.address)

        // 实例化逻辑层
        const areaLogicP = await hre.ethers.getContractAt('AreaLogic', AreaProxy.address)
        console.log('areaLogicP deployed to:', areaLogicP.address)

        // expect(await greeter.greet()).to.equal('Hello, world!')

    })

})
