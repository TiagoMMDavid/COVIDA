'use strict'

const router = require('express').Router()
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
        service.searchGames(name, req.query.limit)
            .then(games => {
                if (!games) {
                    const err = {
                        status: 400,
                        message: 'Invalid limit specified. Must be between 0 and 500'
                    }
                    return next(err)
                }
                resp.json(games)
            })
            .catch(err => next(INTERNAL_ERROR))
    } else {
        const err = {
            status: 400,
            message: 'No name specified'
        }
        return next(err)
    }
})

router.get('/covida/games/top', (req, resp, next) => {
    service.getTopGames(req.query.limit)
        .then(games => {
            if (!games) {
                const err = {
                    status: 400,
                    message: 'Invalid limit specified. Must be between 0 and 500'
                }
                return next(err)
            }
            resp.json(games)
        })
        .catch(err => next(INTERNAL_ERROR))
})

router.get('/covida/games/:game', (req, resp, next) => {
    service.getGameById(req.params.game)
        .then(game => {
            if (!game) {
                const err = {
                    status: 404,
                    message: 'Game does not exist'
                }
                return next(err)
            }
            resp.json(game)
        })
        .catch(err => next(INTERNAL_ERROR))
})

router.get('/covida/groups/:group/games', (req, resp, next) => {
    service.listGroupGames(req.params.group, req.query.min, req.query.max)
        .then(groupGames => {
            const group = groupGames.group
            const games = groupGames.games

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
        .catch(err => next(INTERNAL_ERROR))
})

router.get('/covida/groups/:group', (req, resp, next) => {
    service.getGroup(req.params.group)
        .then(group => {
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
        .catch(err => next(INTERNAL_ERROR))
})

router.get('/covida/groups', (req, resp, next) => {
    service.getGroups()
        .then(groups => {
            const host = req.headers.host
            groups = groups.map(group => {
                group.groupDetails = encodeURI(`http://${host}/covida/groups/${group.id}`)
                return group
            })
            resp.json(groups)
        })
        .catch(err => next(INTERNAL_ERROR))
})

router.get('/covida', (req, resp, next) => {
    const host = req.headers.host
    resp.json({
        topGames: `http://${host}/covida/games/top`,
        getGroups: `http://${host}/covida/groups`
    })
})

router.put('/covida/groups/:group/games', bodyParser, (req, resp, next) => {
    const groupId = req.params.group
    const gameName = req.body.name
    if (!gameName) {
        const err = {
            status: 400,
            message: 'No game specified'
        }
        return next(err)
    }
    
    service.addGameToGroup(groupId, gameName)
        .then(groupGame => {
            const game = groupGame.game
            const group = groupGame.group

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
                message: `Game '${game.name}' added to group '${group.name}' (id '${group.id}') successfully`,
                groupDetails: encodeURI(`http://${host}/covida/groups/${group.id}`),
                gameDetails: `http://${host}/covida/games/${game.id}`
            })
        })
        .catch(err => next(INTERNAL_ERROR))
})

router.put('/covida/groups/:group', bodyParser, (req, resp, next) => {
    const groupId = req.params.group
    const newName = req.body.name
    const newDescription = req.body.description

    if (!newName && !newDescription) {
        const err = {
            status: 400,
            message: 'No new description or name specified'
        }
        return next(err)
    }

    service.editGroup(groupId, newName, newDescription)
        .then(group => {
            if (!group) {
                const err = {
                    status: 404,
                    message: 'Group does not exist'
                }
                return next(err)
            }

            const host = req.headers.host
            resp.json({
                status: 200,
                message: `Group '${groupId}' edited successfully`,
                groupDetails: encodeURI(`http://${host}/covida/groups/${group.id}`)
            })
        })
        .catch(err => next(INTERNAL_ERROR))
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

    service.addGroup(name, description)
        .then(group => {
            const host = req.headers.host
            resp.status(201)
            resp.json({
                status: 201,
                message: `Group '${group.name}' (id '${group.id}') added successfully`,
                groupDetails: encodeURI(`http://${host}/covida/groups/${group.id}`)
            })
        })
        .catch(err => next(INTERNAL_ERROR))
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

router.delete('/covida/groups/:group', (req, resp, next) => {
    service.deleteGroup(req.params.group)
        .then(group => {
            if (!group) {
                const err = {
                    status: 404,
                    message: 'Group does not exist'
                }
                return next(err)
            }
            resp.json({
                status: 200,
                message: `Group '${group.name}' removed successfully`
            })
        })
        .catch(err => next(INTERNAL_ERROR))
})
