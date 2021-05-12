import schedule from 'node-schedule'
import axios from 'axios' 

const  scheduleCronstyle = ()=>{
    schedule.scheduleJob("10 * * * *", () => {
        const host = "http://localhost:5000/"
        axios.get(host + "api/updateLendTotalInfo")
        axios.get(host + "api/updatePriceOracle")
    })
}

scheduleCronstyle()