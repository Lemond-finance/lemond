const { expect } = require("chai");

describe("Greeter", function() {
    // it("Should return the new greeting once it's changed", async function() {
    //   const Greeter = await ethers.getContractFactory("Greeter");
    //   const greeter = await Greeter.deploy("Hello, world!");

    //   await greeter.deployed();
    //   expect(await greeter.greet()).to.equal("Hello, world!");

    //   await greeter.setGreeting("Hola, mundo!");
    //   expect(await greeter.greet()).to.equal("Hola, mundo!");
    // });

    it("Should return the new greeting once it's changed", async function() {
        const NeedReservationLogic = await hre.ethers.getContractFactory('NeedReservationLogic')
        const needReservationLogic = await NeedReservationLogic.deploy()

        await needReservationLogic.deployed()
            //  expect(await needReservationLogic.insertCatalogInfo("{\"catalogName\":\"烟草专卖零售许可证\",\"matterCode\":\"\",\"catalogInfoId\":\"ff8080816e1a4bae016e879c6a9601c2\",\"licenseType\":\"烟草专卖零售许可证\",\"catalogType\":\"10\",\"orgCode\":\"省烟草专卖局\",\"modeCode\":\"手工\",\"customCatalogInfos\":[{\"licAttrSource\":\"申请人填报\",\"licAttrDesc\":\"只能中文字母数字组合且最大长度为100\",\"isDictionaries\":\"\",\"isFace\":\"是\",\"name\":\"许可证号\",\"isRequire\":\"是\",\"licAttrStyle\":\"最大长度为d的中文字母数字组合\",\"sensitiveRule\":\"\",\"CustomCatalogInfoID\":\"ff8080816e1a4bae016e879c6ab401c3\",\"licAttrFormat\":\"c..100\"}],\"orgLevel\":\"省部级\",\"catalogDescribe\":\"\",\"matterName\":\"\"}"))
            //  expect(await needReservationLogic.getCatalogInfoByUUID('ff8080816e1a4bae016e879c6a9601c2'))
    })

    it("Should return the new greeting once it's changed", async function() {
        const Hello = await hre.ethers.getContractFactory('Hello')
        const hello = await Hello.deploy()

        await hello.deployed()
        expect(await hello.get()).to.equal(1)

        await hello.set(2)
        expect(await hello.get()).to.equal(2)
    })

});