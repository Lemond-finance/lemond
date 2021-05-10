
export default function (router, handle) {
    /** api **/
    router.post("/api/test", require("../container/test").test)

    router.get("/api/getLendInfo", require("../container/lend").getLendInfo)

    // Default catch-all handler to allow Next.js to handle all other routes
    router.all("*", (req, res) => handle(req, res))
}