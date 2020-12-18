'use strict'

const express = require('express')
const routes = require('./routes/covida-web-api')

const PORT = 8000
let server

function init(groupsIndex, done) {
    if(groupsIndex) {
        require('./repo/covida-db').init(groupsIndex)
    }

    const app = express()

    app.use(routes)
    app.use((err, req, resp, next) => {
        resp.status(err.status || 500)
        resp.json(err)
    })
    server = app.listen(PORT, () => {
        console.log(`Listening for HTTP requests on port ${PORT}`)
        if (done) done()
    })
}

function close() {
    server.close()
}

module.exports = { init, close }