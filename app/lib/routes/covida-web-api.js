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

router.get('/covida/games/:game', (req, resp, next) => {
    service.getGameById(req.params.game, (err, game) => {
        if (err) return next(INTERNAL_ERROR)
        resp.json(game || {})
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
        const host = req.headers.host
        group.games = group.games.map(game => {
            game.gameDetails = `http://${host}/covida/games/${game.id}`
            return game
        })
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
    const groupName = req.params.group
    const gameName = req.body.name
    if (!gameName) {
        const err = {
            status: 400,
            message: 'No game specified'
        }
        return next(err)
    }
    service.addGameToGroup(groupName, gameName, (err, group, game) => {
        if (err) return next(INTERNAL_ERROR)
        if (!game) {
            const err = {
                status: 404,
                message: 'Game not found'
            }
            return next(err)
        }
        if (!group) {
            const err = {
                status: 404,
                message: 'Group does not exist'
            }
            return next(err)
        }
        const host = req.headers.host
        resp.status(201)
        resp.json({
            status: 201,
            message: `Game '${game.name}' added to group '${group.name}' successfully`,
            groupDetails: `http://${host}/covida/groups/${group.name}`,
            gameDetails: `http://${host}/covida/games/${game.id}`
        })
    })
})

router.put('/covida/groups/:group', bodyParser, (req, resp, next) => {
    const oldName = req.params.group
    const newName = req.body.name
    const newDescription = req.body.description

    service.editGroup(oldName, newName, newDescription, (err, group) => {
        if (err) return next(INTERNAL_ERROR)
        if (!group) {
            const err = {
                status: 404,
                message: 'Group does not exist'
            }
            return next(err)
        }
        if (!group.name) {
            const err = {
                status: 409,
                message: `Group '${newName}' already exists`
            }
            return next(err)
        }
        const host = req.headers.host
        resp.json({
            status: 200,
            message: `Group '${group.name}' edited successfully`,
            groupDetails: `http://${host}/covida/groups/${group.name}`
        })
    })
})

router.put('/covida/groups', bodyParser, (req, resp, next) => {
    const name = req.body.name
    const description = req.body.description
    if (!name) {
        const err = {
            status: 400,
            message: 'No name specified'
        }
        return next(err)
    }
    service.addGroup(name, description, (err, group) => {
        if (err) return next(INTERNAL_ERROR)
        const host = req.headers.host
        resp.status(201)
        resp.json({
            status: 201,
            message: `Group '${group.name}' added successfully`,
            groupDetails: `http://${host}/covida/groups/${group.name}`
        })
    })
})

router.delete('/covida/groups/:group/games/:game', (req, resp, next) => {
    service.deleteGameFromGroup(req.params.group, req.params.game, (err, group, game) => {
        if (err) return next(INTERNAL_ERROR)
        if (!group) {
            const err = {
                status: 404,
                message: 'Group does not exist'
            }
            return next(err)
        }
        if (!game) {
            const err = {
                status: 404,
                message: `Game does not exist in group '${group.name}'`
            }
            return next(err)
        }
        resp.json({
            status: 200,
            message: `Game '${game.name}' removed from group '${group.name}' successfully`
        })
    })
})
