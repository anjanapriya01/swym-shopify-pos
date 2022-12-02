
const axios = require('axios')
// require('dotenv-safe').config()
const { createHmac } = require('crypto')
const { application } = require('express')

exports.fetchSubscriptions = async (req, res) => {
    console.log("enterring here")
    const email = req.query.useremail
    console.log("email",email);
    // const limit = req.query.limit
    // const offset = req.query.offset
    const timestamp = Date.now()
    if (!email) {
        res.status(404).json({ message: `enter valid email`})
    }
    await getRegidSessionid(email, res.locals.pid, res.locals['swym-store-endpoint'], res.locals['swym-store-secret'], timestamp)
        .then(idRes => {
            console.log('>>> authenticated', idRes)
            getAllSubscriptions(email, idRes.regid, idRes.sessionid, res.locals.pid, res.locals['swym-store-endpoint'],10,0)
                .then(postRes => {
                    console.log('>>>>> bispa list :', postRes)
                    res.json(postRes)
                })
                .catch(error => {
                    res.status(error.status).json(error)})
        })
}
exports.addProductToWatchlist = async (req, res) => {
    console.log("'/bispa/add/subscription' call")
    const email = req.query.useremail
    const epi = Number(req.query.epi)
    const empi = Number(req.query.empi)
    const du = req.query.du
    const adminemail = req.query.email
    const timestamp = Date.now()

    console.log('>>>>',email, ' epi:',typeof (epi), '-', epi, 'empi:', typeof (empi), '-', empi, du, adminemail)

    if (!email) {
        res.status(404).json({ message: `enter valid email`})
    }
    if (!epi) {
        res.status(404).json({ message: `enter valid epi`})
    }
    if (!empi) {
        res.status(404).json({ message: `enter valid empi`})
    }
    if (!adminemail) {
        res.status(404).json({ message: `enter valid logged in user email`})
    }
    if (!du) {
        res.status(404).json({ message: `enter valid product url`})
    }

    getRegidSessionid(email, res.locals.pid, res.locals['swym-store-endpoint'], res.locals['swym-store-secret'], timestamp)
        .then(idRes => {
            // console.log('>>> authenticated', idRes)
            addVariantToWatchlist(email, epi, empi, du, adminemail, idRes.regid, idRes.sessionid, res.locals.pid, res.locals['swym-store-endpoint'])
                .then(postRes => {
                    console.log('>>>>> bispa add subscription :', postRes)
                    res.json(postRes)
                })
                .catch(error => {
                    // console.log('>>> catch block', error)
                    res.status(error.status).json(error)})
        })
}

async function getRegidSessionid(useremail, pid, endpoint, secret, timestamp) {
    timestamp = new Date(parseInt(timestamp))
    timestamp = timestamp.toISOString()
    // const hash = createHmac('sha256', secret)
    //     .update(timestamp)
    //     .digest('hex')
    const hash='bd68234a679f99348c29c29e2b01312fbba9ea36d47d5bb773afb01dbd492c8b'
    const userAgent = 'manageuserdata' 
    let data = new URLSearchParams({
        useragenttype: userAgent
    }).toString()
    const params = new URLSearchParams({
        pid: pid,
        useremail: useremail
    }).toString()
    const url = `${endpoint}/api/admin/intersvc/generate-regid?` + params
    const config = {
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Encoding':'application/json',
            'x-swym-hmac-sha256': hash,
            'x-swym-src': 'manage-user-data',
            'x-swym-rchl': 'ConfigGET'
        },
		
    }
    return axios.post(url, data, config)
        .then(response => { 
            console.log("response.dat",response);
            return response.data})
        .catch(function (error) {
            if (error.response) {
                console.log(error.response.data)
                console.log(error.response.status)
            } else if (error.request) {
                console.log('>>> req error:',error.request)
            } else {
                console.log('Error', error.message)
            }
            console.log('error config:',error.config)
            return error.response
        })
}
async function getAllSubscriptions(email, rid, sessid, pid, endpoint, limit = 10, offset = 0) {
    let data = new URLSearchParams({
        regid: rid,
        sessionid: sessid,
        topic: 'backinstock',
        medium: 'email',
        mediumvalue: `${email}`,
        limit,
        offset
    }).toString()
    const params = new URLSearchParams({
        pid: pid
    }).toString()
    const url = `${endpoint}/api/v3/subscriptions/fetch?` + params
    const config = {
        headers: { 'content-type': 'application/x-www-form-urlencoded','Accept-Encoding':'application/json' }
    }
    return axios.post(url, data, config)
        .then(response => response.data)
        .catch(function (error) {
            if (error.response) {
                console.log(error.response.data)
                console.log(error.response.status)
                console.log(error.response.headers)
            } else if (error.request) {
                console.log('>>> req error:',error.request)
            } else {
                console.log('Error', error.message)
            }
            console.log('error config:',error.config)
        })
}
async function addVariantToWatchlist(email, epi, empi, du, adminemail, rid, sessid, pid, endpoint) {
    let addData = JSON.stringify(
        {
            "empi": empi, 
            "epi": epi, 
            "medium": "email",
            "mediumvalue": email,
            "topic": "backinstock",
            "du": du
        })
	
    let data = new URLSearchParams({
        regid: rid,
        sessionid: sessid,
        updatedby: `${adminemail}`,
        subscription: addData
    }).toString()
    const params = new URLSearchParams({
        pid: pid
    }).toString()
    const url = `${endpoint}/api/v3/subscriptions/add?` + params
    const config = {
        headers: { 'content-type': 'application/x-www-form-urlencoded','Accept-Encoding':'application/json' }
    }
    return axios.post(url, data, config)
        .then(response => response.data)
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data)
                console.log(error.response.status)
                console.log(error.response.headers)
                // console.log('>>> res error:', error.response)
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log('>>> req error:',error.request)
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message)
            }
            console.log('error config:',error.config)
        })
}
