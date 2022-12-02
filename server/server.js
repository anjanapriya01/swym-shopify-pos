const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 4001
const path = require('path')
const sbisaRouter = require('./routes/sbisa-route')

app.use(express.static(path.join(__dirname, 'build')))
app.use(express.static(path.join(__dirname,'public')))
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build'))
})

app.use('/sbisa', sbisaRouter)

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something is broken.')
})
app.use(function (err,req, res, next) {
    console.error(err.stack)
    res.status(404).send('API server is up but with the 404 error.')
})
app.listen(port, async () => {
    console.log(
        `API server is listening on port ${port}`
    );
});