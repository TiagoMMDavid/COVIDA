'use strict'

const cookieParser = require('cookie-parser')
const expressSession = require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true })
const express = require('express')
const bodyParser = require('body-parser').urlencoded({ extended: false })
const flash = require('connect-flash')
const routesApi = require('./routes/covida-web-api')
const routesWebApi = require('./routes/covida-web-routes')
const sitemap = require('express-sitemap-html')

const PORT = 8000
let server

function init(groupsIndex, done) {
    if(groupsIndex) {
        require('./repo/covida-db').init(groupsIndex)
    }

    const app = express()
    app.set('view engine', 'hbs')
    app.set('views', './lib/views')

    app.use(express.static('public'))
    app.use(bodyParser)
    app.use(cookieParser())
    app.use(expressSession)
    app.use(flash())

    app.use('/api', routesApi)
    app.use(routesWebApi)
    sitemap.swagger('COVIDA', app)

    app.use('/api', (err, req, resp, next) => {
        resp.status(err.status || 500)
        resp.json(err)
    })

    app.use((err, req, resp, next) => {
        resp.status(err.status || 500)
        resp.render('error', {
            'status': err.status,
            'message': err.message
        })
    })

    app.use((req, resp, next) => {
        resp.status(404)
        resp.render('error', {
            'status': 404,
            'message': 'Sorry, that page does not exist!'
        })
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