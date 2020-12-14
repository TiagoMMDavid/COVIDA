'use strict'

const express = require('express')
const routes = require('./routes/covida-web-api')

const PORT = 8000

// TODO: Process arguments
if(process.argv.length > 2) {
    //require('./repo/covida-db').init(process.argv[2])
}

const app = express()

app.use(routes)
app.use((err, req, resp, next) => {
    resp.status(err.status || 500)
    resp.json(err)
})
app.listen(PORT, () => {
    console.log(`Listening for HTTP requests on port ${PORT}`)
    if (process.send) process.send({ webRunning: true })
})