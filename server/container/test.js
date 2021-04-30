import db from "../database/db.js"

const User = db.User

export async function test(req, res) {
    console.log(req, res)
    let callBackData = {
        success: true,
        status: 200,
        message: "Success",
        data: null,
    }
    res.send(callBackData)
}
