const jwt=require('jsonwebtoken');
const axios = require('axios');

module.exports.isAuthorized = async function(req, res, next) {
    console.log('Auth middleware query params >>>', req.query)
    const token = req.query.token
    //const timestamp = req.query.timestamp
    const timestamp=Date.now()
    const payload=getTokenVerified(token, timestamp);
    if (payload.error){
        if(payload.error=='invalid token'){
            return res.status(401).json({msg: "Invalid Token"});
        }
        else if (payload.error=='jwt expired'){
            return res.status(401).json({msg: "JWT Token expired"});
        }
        else{
            return res.status(401).json({msg:payload.error});
        }
    }
    const platformUrl=payload.dest;
    getPID(platformUrl)
    .then((data)=>{
        console.log("pid",data.pid)
        if(data.error){
            return res.status(401).json({msg:data.message})
        }
        //const pid=data.pid;
        res.locals={pid:data.pid,'swym-store-endpoint':data['swym-store-endpoint'],'swym-store-secret':'NyUFqqxxOwe8KDNA7ZCZac23'}
        return next()
    })
    .catch((error) => {
        console.log("error>>>>>", error.response.data);
        return next(error)});
}

function getTokenVerified(token, timestamp) {
    timestamp = new Date(parseInt(timestamp))
    timestamp = timestamp.toISOString()
    try{
        const payload=jwt.verify(token, 'e6d605c2e6d539c0dd03c1a883539c2e', {
            algorithms: ['HS256'],
            clockTolerance: 10,
          });
          return payload;
      //console.log(payload)
    }
    catch(e){
        console.log("error is",e.message);
        return {'error':e.message}; 
    }
    
}
function getPID(platformUrl) {
    const queryparams = new URLSearchParams({
        'platform-url':platformUrl,
        'platform' : 'Shopify'
    }).toString();
    const url = `https://admin-sandbox.swymrelay.com/intersvc/find/platform-url?` + queryparams;
    const config = {
        headers: { 
            'Accept': 'application/json', 
            'x-swym-hmac-sha256': '02dedccb9b87a03c5bdfdac9aac1e736eaac7ab55284e9b2b1230d38e32b86f2',
            'x-swym-src': 'swym-admin',
            'x-swym-rchl': 'ConfigGET'
        }
    };
    return axios.get(url,config)
        .then(response => {
            //console.log(">>>>>>resp",response.data);
            return response.data.data;})
        .catch((error) => {
            console.log("error>>>>>", error.response.data);
            return error.response;}); 

}
