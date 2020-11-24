'use strict'

const express = require('express')
const routes = require('./routes/covida-web-api')

const PORT = 8000

if(process.argv.length > 2) {
    require('./repo/igdb-data').init(process.argv[2])
}

const app = express()

app.use(routes)
app.use((err, req, resp, next) => {
    resp.status(err.status)
    resp.json(err)
})
app.listen(PORT, () => console.log(`Listening for HTTP requests on port ${PORT}`))