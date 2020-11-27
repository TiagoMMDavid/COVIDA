'use strict'

const Router = require('express').Router
const router = Router()
const bodyParser = require('body-parser').urlencoded({ extended: false })
const service = require('./../repo/covida-services')

module.exports = router

const INTERNAL_ERROR = {
    status: 500,
    message: 'Internal Server Error' 
}

router.get('/covida/games/search', (req, resp, next) => {
    const name = req.query.name
    if (name) {
        service.searchGames(name, req.query.limit, (err, games) => {
            if (err) return next(INTERNAL_ERROR)
            resp.json(games)
        })
    } else {
        const err = {
            status: 400,
            message: 'No name specified'
        }
        return next(err)
    }
})

router.get('/covida/games/top', (req, resp, next) => {
    service.getTopGames(req.query.limit, (err, games) => {
        if (err) return next(INTERNAL_ERROR)
        resp.json(games)
    })
})

router.get('/covida/groups/:group/games', (req, resp, next) => {
    service.listGroupGames(req.params.group, req.query.min, req.query.max, (err, group, games) => {
        if (err) return next(INTERNAL_ERROR)
        if (!group) {
            const err = {
                status: 404,
                message: 'Group does not exist'
            }
            return next(err)
        }
        if (!games) {
            const err = {
                status: 400,
                message: 'Min can\'t be greater than max'
            }
            return next(err)
        }
        resp.json(games)
    })
})

router.get('/covida/groups/:group', (req, resp, next) => {
    service.getGroup(req.params.group, (err, group) => {
        if (err) return next(INTERNAL_ERROR)
        if (!group) {
            const err = {
                status: 404,
                message: 'Group does not exist'
            }
            return next(err)
        }
        resp.json(group)
    })
})

router.get('/covida/groups', (req, resp, next) => {
    service.getGroups((err, groups) => {
        if (err) return next(INTERNAL_ERROR)
        resp.json(groups)
    })
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
