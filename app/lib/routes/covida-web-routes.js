'use strict'

const router = require('express').Router()
const service = require('./../repo/covida-services')

module.exports = router

const INTERNAL_ERROR = {
    status: 500,
    message: 'Internal Server Error' 
}

/*
router.get('/covida/games/:game', handlerGameById)
router.get('/covida/groups/:group/games', handlerGroupGames)
router.get('/covida/groups/:group', handlerGroupById)
router.get('/covida/groups', handlerGroups)
*/

router.get('/covida/games/top', handlerTopGames)
router.get('/covida/games/search', handlerSearchGame)
router.get('/covida', handlerHomepage)

/*
router.put('/covida/groups/:group/games', handlerAddGameToGroup)
router.put('/covida/groups/:group', handlerEditGroup)
router.put('/covida/groups', handlerAddGroup)

router.delete('/covida/groups/:group/games/:game', handlerDeleteGame)
router.delete('/covida/groups/:group', handlerDeleteGroup)
*/

function handlerHomepage(req, resp, next) {
    const host = req.headers.host
    resp.render('homepage', {
        links: [
            {
                name: 'Browse Top Games',
                link: `http://${host}/covida/games/top`
            },
            {
                name: 'Search Games',
                link: `http://${host}/covida/games/search`
            }
        ]
    })
}

function handlerTopGames(req, resp, next) {
    const limit = req.query.limit || '10'
    const err = req.flash('limitError')
    service.getTopGames(Number(limit))
        .then(games => {
            if (!games) {
                req.flash('limitError', 'Invalid limit specified. Must be between 0 and 500')
                return resp.redirect('/covida/games/top')
            }
            resp.render('topGames', {
                'games': games.map(game => {
                    game.total_rating = game.total_rating.toFixed(2)
                    return game}),
                'limit': limit,
                'messages': {
                    'error': err
                }
            })
        })
        .catch(err => next(INTERNAL_ERROR))
}

function handlerSearchGame(req, resp, next) {
    const limit = req.query.limit || '10'
    const err = req.flash('limitError')
    const name = req.query.name
    if (name) {
        service.searchGames(name, Number(limit))
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
                    'searchedGame': name
                })
            })
            .catch(err => next(INTERNAL_ERROR))
    } else {
        resp.render('searchGames', {
            'limit': limit,
            'messages': {
                'error': err
            }
        })
    }
}