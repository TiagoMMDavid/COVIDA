'use strict'

//const services = require('./../repo/covida-services')

const Router = require('express').Router
const router = Router()
const bodyParser = require('body-parser').urlencoded({ extended: false })
const igdbData = require('./../repo/igdb-data')

module.exports = router

const DEFAULT_LIMIT = 10

router.get('/covida/games/search', (req, resp, next) => {
    // TODO:
    const limit = req.query.limit || DEFAULT_LIMIT
    const name = req.query.name
    if (name) {
        console.log(limit)
        igdbData.searchGames(name, limit, (err, games) => {
            if (err) return next(err)
            resp.json(games)
        })
    } else {
        const err = new Error()
        err.status = 400
        err.message = 'You need to specify the name of the games to search'
        return next(err)
    }

})

router.get('/covida/games/top', (req, resp, next) => {
    // TODO:
    const limit = req.query.limit || DEFAULT_LIMIT

    igdbData.getTopGames(limit, (err, games) => {
        if (err) next(err)
        resp.json(games)
    })
})

router.get('/covida/groups/:group/games', (req, resp, next) => {
    // TODO:
    resp.end()
})

router.get('/covida/groups/:group', (req, resp, next) => {
    // TODO:
    resp.end()
})

router.get('/covida/groups', (req, resp, next) => {
    // TODO:
    resp.end()
})

router.put('/covida/groups/:group/games', bodyParser, (req, resp, next) => {
    // TODO:
    resp.end()
})

router.put('/covida/groups/:group', bodyParser, (req, resp, next) => {
    // TODO:
    resp.end()
})

router.put('/covida/groups', bodyParser, (req, resp, next) => {
    // TODO:
    resp.end()
})

router.delete('/covida/groups/:group/games/:game', (req, resp, next) => {
    // TODO:
    resp.end()
})
