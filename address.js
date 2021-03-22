const axios = require('axios')

var offset = 0
const array = []


function getAddress(){
    axios.get(`https://www.oklink.com/api/explorer/v1/okexchain_test/oipTokens/holders/okexchain1uena30gc95t96tn3eaerzk73zlmfgqy532tvp3?t=1616006105373&offset=${offset}&limit=100&address=okexchain1uena30gc95t96tn3eaerzk73zlmfgqy532tvp3`)
    .then(result=>{
        const element = result.data.data.hits;
        for(var i = 0; i < element.length; i ++ ){
            array.push(element[i]['holderAddress'])
        }
        
        if(offset <= 10000){
            getAddress()
        }
        if(offset == 10000){
            console.log(JSON.stringify(array))
        }
        offset += 100
    })
}

getAddress()




