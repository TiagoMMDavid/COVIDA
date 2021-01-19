'use strict'

const router = require('express').Router()
const service = require('../repo/covida-services')
const users = require('../repo/covida-users')

module.exports = router

const INTERNAL_ERROR = {
    status: 500,
    message: 'Internal server error' 
}

router.get('/covida/games/search', handlerSearchGame)
router.get('/covida/games/top', handlerTopGames)
router.get('/covida/games/:game', handlerGameById)
router.get('/covida/groups/:group/games', handlerGroupGames)
router.get('/covida/groups/:group', handlerGroupById)
router.get('/covida/groups', handlerGroups)
router.get('/covida', handlerHomepage)

router.put('/covida/groups/:group/games', handlerAddGameToGroup)
router.put('/covida/groups/:group', handlerEditGroup)
router.post('/covida/groups', handlerAddGroup)

router.delete('/covida/groups/:group/games/:game', handlerDeleteGame)
router.delete('/covida/groups/:group', handlerDeleteGroup)

function handlerSearchGame(req, resp, next) {
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
}

function handlerTopGames(req, resp, next) {
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
}

function handlerGameById(req, resp, next) {
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
}

function handlerGroupGames(req, resp, next) {
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
}

function handlerGroupById(req, resp, next) {
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
                game.gameDetails = `http://${host}/api/covida/games/${game.id}`
                return game
            })
            resp.json(group)
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerGroups(req, resp, next) {
    service.getGroups()
        .then(groups => {
            const host = req.headers.host
            groups = groups.map(group => {
                group.groupDetails = encodeURI(`http://${host}/api/covida/groups/${group.id}`)
                return group
            })
            resp.json(groups)
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerHomepage(req, resp, next) {
    const host = req.headers.host
    resp.json({
        topGames: `http://${host}/api/covida/games/top`,
        getGroups: `http://${host}/api/covida/groups`
    })
}

function handlerAddGameToGroup(req, resp, next) {
    const groupId = req.params.group
    const gameName = req.body.name
    const gameId = req.body.id

    if (!gameName && !gameId) {
        const err = {
            status: 400,
            message: 'No game or ID specified'
        }
        return next(err)
    }
    
    service.addGameToGroup(groupId, gameName, gameId)
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
                matchId: game.id,
                matchName: game.name,
                groupDetails: encodeURI(`http://${host}/api/covida/groups/${group.id}`),
                gameDetails: `http://${host}/api/covida/games/${game.id}`
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerEditGroup(req, resp, next) {
    const groupId = req.params.group
    const newName = req.body.name
    const newDescription = req.body.description
    const username = req.body.username

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
                next(err)
                return null
            }
            if (username) {
                return users.editGroup(decodeURIComponent(username), group.id, group.name).then(user => group)
            }
            return group
        })
        .then(group => {
            if (group) {
                const host = req.headers.host
                resp.json({
                    status: 200,
                    message: `Group '${groupId}' edited successfully`,
                    groupDetails: encodeURI(`http://${host}/api/covida/groups/${group.id}`)
                })
            }
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerAddGroup(req, resp, next) {
    const name = req.body.name
    const description = req.body.description
    const username = req.body.username
    if (!name) {
        const err = {
            status: 400,
            message: 'No name specified'
        }
        return next(err)
    }

    service.addGroup(name, description)
        .then(group => {
            if (username) {
                return users.addGroup(decodeURIComponent(username), group.id, group.name).then(user => group)
            }
            return group
        })
        .then(group => {
            const host = req.headers.host
            resp.status(201)
            resp.json({
                status: 201,
                message: `Group '${group.name}' (id '${group.id}') added successfully`,
                groupId: group.id,
                groupDetails: encodeURI(`http://${host}/api/covida/groups/${group.id}`)
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerDeleteGame(req, resp, next) {
    service.deleteGameFromGroup(req.params.group, req.params.game)
        .then(groupGame => {
            const group = groupGame.group
            const game = groupGame.game

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
                    message: `Game does not exist in group '${group.name}' (id '${group.id}')`
                }
                return next(err)
            }
            resp.json({
                status: 200,
                message: `Game '${game.name}' removed from group '${group.name}' (id '${group.id}') successfully`
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerDeleteGroup(req, resp, next) {
    service.deleteGroup(req.params.group)
        .then(group => {
            const username = req.body.username
            if (username) {
                return users.removeGroup(decodeURIComponent(username), group.id).then(user => group)
            }
            return group
        })
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
                message: `Group '${group.name}' (id '${group.id}') removed successfully`
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}
