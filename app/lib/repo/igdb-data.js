'use strict'

const urllib = require('urllib')

const IGDB_HOST = 'https://api.igdb.com/v4/games'
const IGDB_CLIENT_ID = process.env.COVIDA_CLIENT_ID
const IGDB_AUTHORIZATION_HEADER = `Bearer ${process.env.COVIDA_AUTHORIZATION}`

const IGDB_COMMON_BODY_FIELDS = 'fields name, total_rating, summary, follows; where category = 0;'
const IGDB_TOP_GAMES = 'sort follows desc; where follows != null;'
const IGDB_SEARCH = 'search'
const IGDB_GET_GAMES_BY_IDS = 'sort total_rating desc; where id ='
const IGDB_BODY_FIELDS_LIMIT = 'limit'

const IGDB_MAX_LIMIT = 500

/**
 * @typedef GameDetail
 * @property {Integer} id
 * @property {String} name
 * @property {String} summary
 * @property {Double} total_rating
 * @property {Integer} follows
 */

/**
 * Function to get the current top games of IGDB
 * @param {Number} limit limit of results
 * @param {function(Error, Array<GameDetail>)} cb Callback receiving an array of GameDetail or Error if not succeeded
 */
function getTopGames(limit, cb) {
    if (limit > IGDB_MAX_LIMIT || limit < 0) {
        return cb(null, null)
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': IGDB_AUTHORIZATION_HEADER,
            'Accept': 'application/json'
        },
        content: `${IGDB_COMMON_BODY_FIELDS} ${IGDB_TOP_GAMES} ${IGDB_BODY_FIELDS_LIMIT} ${limit};`
    }
    urllib.request(IGDB_HOST, options, (err, data, res) => {
        if(err) return cb(err)
        const obj = JSON.parse(data)
        cb(null, obj)
    })
}

/**
 * Search for games by its name
 * @param {String} game game name
 * @param {Number} limit limit of results
 * @param {function(Error, Array<GameDetail>)} cb Callback receives an array of GameDetail objects with given name (can be empty)
 */
function searchGames(game, limit, cb) {
    if (limit > IGDB_MAX_LIMIT || limit < 0) {
        return cb(null, null)
    }

    const options = {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': IGDB_AUTHORIZATION_HEADER,
            'Accept': 'application/json'
        },
        content: `${IGDB_COMMON_BODY_FIELDS} ${IGDB_SEARCH} "${game}"; ${IGDB_BODY_FIELDS_LIMIT} ${limit};`
    }
    urllib.request(IGDB_HOST, options, (err, data, res) => {
        if(err) return cb(err)
        const obj = JSON.parse(data)
        cb(null, obj)
    })
}

/** 
 * Gets the games with given ids. The array returned is sorted by rating, from highest to lowest
 * @param {Array<Integer>} ids ids of games
 * @param {function(Error, Array<GameDetail>)} cb Callback receives an array of GameDetail objects with given ids (can be empty)
 */
function getGamesByIds(ids, cb) {
    if (!ids || ids.length == 0)
        return cb(null, [])

    let formattedIds = '('
    ids.forEach((id, index) => {
        formattedIds += id
        if (index != ids.length - 1)
            formattedIds += ', '
    })
    formattedIds += ')'

    const options = {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': IGDB_AUTHORIZATION_HEADER,
            'Accept': 'application/json'
        },
        content: `${IGDB_COMMON_BODY_FIELDS} ${IGDB_GET_GAMES_BY_IDS} ${formattedIds};`
    }
    
    urllib.request(IGDB_HOST, options, (err, data, res) => {
        if(err) return cb(err)
        const obj = JSON.parse(data)
        cb(null, obj)
    })
}

module.exports = {
    getTopGames,
    searchGames,
    getGamesByIds
}