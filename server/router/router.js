
export default function (router, handle) {
    /** api **/
    router.post("/api/test", require("../container/test").test)

    router.get("/api/getTotalValueLocked", require("../container/lend").getTotalValueLocked)
    router.get("/api/getLendInfo", require("../container/lend").getLendInfo)
    router.get("/api/updateLendTotalInfo", require("../container/lend").updateLendTotalInfo)
    router.get("/api/updatePriceOracle", require("../container/lend").updatePriceOracle)
    router.get("/api/airdrop", require("../container/lend").airdrop)

    
    // Default catch-all handler to allow Next.js to handle all other routes
    router.all("*", (req, res) => handle(req, res))
}