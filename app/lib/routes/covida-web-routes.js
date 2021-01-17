'use strict'

const router = require('express').Router()
const service = require('./../repo/covida-services')

module.exports = router

const INTERNAL_ERROR = {
    status: 500,
    message: 'Internal server error' 
}

router.get('/covida/games/top', handlerTopGames)
router.get('/covida/games/search', handlerSearchGame)
router.get('/covida/games/:game', handlerGameById)
router.get('/covida/groups/:group', isAuthenticated, handlerGroupById)
router.get('/covida/groups', isAuthenticated, handlerGroups)
router.get('/covida', handlerHomepage)

//TODO: router.put('/covida/groups/:group', handlerEditGroup)

function isAuthenticated(req, resp, next) {
    if(req.user) next()
    else resp.redirect('/covida/login')
}

function handlerHomepage(req, resp, next) {
    const host = req.headers.host
    resp.render('homepage', {
        'links': [
            {
                'name': 'Browse Top Games',
                'link': `http://${host}/covida/games/top`
            },
            {
                'name': 'Search Games',
                'link': `http://${host}/covida/games/search`
            }
        ],
        'user': req.user
    })
}

function handlerTopGames(req, resp, next) {
    const limit = req.query.limit || 10
    const err = req.flash('limitError')
    service.getTopGames(limit)
        .then(games => {
            if (!games) {
                req.flash('limitError', 'Invalid limit specified. Must be between 0 and 500')
                return resp.redirect('/covida/games/top')
            }
            resp.render('topGames', {
                'games': games.map(game => {
                    if (game.total_rating)
                        game.total_rating = game.total_rating.toFixed(2)
                    return game}),
                'limit': limit,
                'messages': {
                    'error': err
                },
                'user': req.user
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerGameById(req, resp, next) {
    service.getGameById(req.params.game)
        .then(game => {
            if (!game) {
                return resp.redirect('/404')
            }

            if (game.total_rating) {
                game.total_rating = game.total_rating.toFixed(2)
            }
            resp.render('game', {
                'game': game,
                'user': req.user
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerSearchGame(req, resp, next) {
    const limit = req.query.limit || 10
    const err = req.flash('limitError')
    const name = req.query.name
    if (name) {
        service.searchGames(name, limit)
            .then(games => {
                if (!games) {
                    req.flash('limitError', 'Invalid limit specified. Must be between 0 and 500')
                    return resp.redirect('/covida/games/search')
                }
                resp.render('searchGames', {
                    'games': games.map(game => {
                        if (game.total_rating) 
                            game.total_rating = game.total_rating.toFixed(2)
                        return game}),
                    'limit': limit,
                    'messages': {
                        'error': err
                    },
                    'searchedGame': name,
                    'isEmpty': games.length == 0,
                    'user': req.user
                })
            })
            .catch(err => next(INTERNAL_ERROR))
    } else {
        resp.render('searchGames', {
            'limit': limit,
            'messages': {
                'error': err
            },
            'user': req.user
        })
    }
}

function handlerGroups(req, resp, next) {
    service.getGroups()
        .then(groups => {
            const host = req.headers.host
            groups = groups.map(group => {
                group.groupDetails = encodeURI(`http://${host}/covida/groups/${group.id}`)

                if (group.description.length == 0)
                    group.description = null
                return group
            })
            resp.render('groupsList', {
                'groups': groups,
                'isEmpty': groups.length == 0,
                'user': req.user
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerGroupById(req, resp, next) {
    service.getGroup(req.params.group)
        .then(group => {
            if (!group) {
                return resp.redirect('/404')
            }

            const host = req.headers.host
            group.games = group.games.map(game => {
                game.gameDetails = `http://${host}/covida/games/${game.id}`

                if (game.total_rating) 
                    game.total_rating = game.total_rating.toFixed(2)
                return game
            })

            resp.render('groupDetails', {
                'group': group,
                'isEmpty': group.games.length == 0,
                'user': req.user
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}