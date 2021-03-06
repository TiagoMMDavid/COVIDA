'use strict'

const router = require('express').Router()
const service = require('./../repo/covida-services')

module.exports = router

const INTERNAL_ERROR = {
    status: 500,
    message: 'Internal server error' 
}

router.get('/covida/games/top', keepPageForAuthRedirect, handlerTopGames)
router.get('/covida/games/search', keepPageForAuthRedirect, handlerSearchGame)
router.get('/covida/games/:game', keepPageForAuthRedirect, handlerGameById)
router.get('/covida/groups/:group', isAuthenticated, handlerGroupById)
router.get('/covida/groups', isAuthenticated, handlerGroups)
router.get('/covida', keepPageForAuthRedirect, handlerHomepage)
router.get('/', handlerRoot)

function isAuthenticated(req, resp, next) {
    if(req.user) {
        req.session.redirectUrl = null
        next()
    }
    else {
        req.session.redirectUrl = req.url
        resp.redirect('/covida/login')
    }
}

function keepPageForAuthRedirect(req, resp, next) {
    req.session.redirectUrl = req.url
    next()
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
        'messages': {
            'error': req.flash('userError'),
            'success': req.flash('userInfo')
        },
        'user': req.user
    })
}

function handlerRoot(req, resp, next) {
    resp.redirect('/covida')
}

function handlerTopGames(req, resp, next) {
    // Check if limit is a number
    const limit = req.query.limit || 10
    if (limit && isNaN(Number(limit))) {
        req.flash('limitError', 'Invalid limit specified. Must be a number between 0 and 500')
        return resp.redirect('/covida/games/top')
    }

    const err = req.flash('limitError')
    service.getTopGames(limit)
        .then(games => {
            if (!games) {
                req.flash('limitError', 'Invalid limit specified. Must be a number between 0 and 500')
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
                const err = {
                    'status': 404,
                    'message': 'Game does not exist!'
                }
                return next(err)
            }

            if (game.total_rating) {
                game.total_rating = game.total_rating.toFixed(2)
            }
            resp.render('gameDetails', {
                'game': game,
                'user': req.user
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerSearchGame(req, resp, next) {
    // Check if limit is a number
    const limit = req.query.limit || 10
    const name = req.query.name
    if (limit && isNaN(Number(limit))) {
        req.flash('limitError', 'Invalid limit specified. Must be a number between 0 and 500')
        return resp.redirect(`/covida/games/search?name=${name || ''}`)
    }

    const err = req.flash('limitError')
    if (name) {
        service.searchGames(name, limit)
            .then(games => {
                if (!games) {
                    req.flash('limitError', 'Invalid limit specified. Must be a number between 0 and 500')
                    return resp.redirect(`/covida/games/search?name=${name || ''}`)
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
            const user = req.user
            groups = groups
                .filter(group => user.groups.some(userGroup => userGroup.id == group.id))
                .map(group => {
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
    const min = req.query.min
    const max = req.query.max
    const limitErr = req.flash('limitError')

    service.getGroup(req.params.group)
        .then(group => {
            if (!group || !req.user.groups.some(userGroup => userGroup.id == group.id)) {
                const err = {
                    'status': 404,
                    'message': 'Group does not exist!'
                }
                return next(err)
            }

            if (limitErr.length == 0 && (min != null || max != null)) {
                return service.listGroupGames(group.id, Number(min), Number(max))
            } else {
                let ids = []
                group.games.forEach(game => ids.push(game.id))
                return service.getGamesByIds(ids)
                    .then(games => {
                        return {
                            'group': group,
                            'games': games
                        }
                    })
            }
        })
        .then(groupGames => {
            if(groupGames) {
                if (!groupGames.games) {
                    req.flash('limitError', 'Invalid limit specified. Minimum must be less than maximum.')
                    return resp.redirect(req.originalUrl)
                }
            
                const host = req.headers.host

                const group = groupGames.group
                group.games = groupGames.games.map(game => {
                    game.gameDetails = `http://${host}/covida/games/${game.id}`

                    if (game.total_rating) 
                        game.total_rating = game.total_rating.toFixed(2)
                    return game
                })

                resp.render('groupDetails', {
                    'group': group,
                    'isEmpty': group.games.length == 0,
                    'min': min,
                    'max': max,
                    'messages': {
                        'error': limitErr
                    },
                    'user': req.user
                })
            }
        })
        .catch(err => next(INTERNAL_ERROR))
}