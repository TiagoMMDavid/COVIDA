'use strict'

const Router = require('express').Router
const router = Router()
const bodyParser = require('body-parser').urlencoded({ extended: false })
const service = require('./../repo/covida-services')

module.exports = router

router.get('/covida/games/search', (req, resp, next) => {
    const name = req.query.name
    if (name) {
        service.searchGames(name, req.query.limit, (err, games) => {
            if (err) return next(err)
            resp.json(games)
        })
    } else {
        const err = {
            status: 400,
            message: 'You need to specify the name of the games to search'
        }
        return next(err)
    }
})

router.get('/covida/games/top', (req, resp, next) => {
    service.getTopGames(req.query.limit, (err, games) => {
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
