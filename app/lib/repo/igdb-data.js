'use strict'

const urllib = require('urllib')

const IGDB_HOST = 'https://api.igdb.com/v4/games'
const IGDB_CLIENT_ID = '8cj604as0sl0vn27qw84caqgtvj295'
const IGDB_AUTHORIZATION_HEADER = 'Bearer h9tr09eft8w1sm8ffw0rot65krukjh'
const IGDB_BODY_FIELDS_SEARCH = 'fields name, rating, summary, follows; where category = 0; search'
const IGDB_BODY_FIELDS_TOPGAMES = 'fields name, rating, summary, follows; sort follows desc; where follows != null & category = 0;'
const IGDB_BODY_FIELDS_LIMIT = 'limit'

/**
 * @typedef Game
 * @property {Integer} id
 * @property {String} name
 * @property {String} summary
 * @property {Double} rating
 * @property {Integer} follows
 */

/**
 * @param {Number} limit limit of results
 * @param {function(Error, Array<Game>)} cb Callback receiving an array with game names or Error if not succeeded
 */
function getTopGames(limit, cb) {
    const options = {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': IGDB_AUTHORIZATION_HEADER,
            'Accept': 'application/json'
        },
        content: `${IGDB_BODY_FIELDS_TOPGAMES} ${IGDB_BODY_FIELDS_LIMIT} ${limit};`
    }
    urllib.request(IGDB_HOST, options, (err, data, res) => {
        if(err) return cb(err)
        const obj = JSON.parse(data)
        cb(null, obj)
    })
}

/**
 * @param {String} game game name
 * @param {Number} limit limit of results
 * @param {function(Error, Array<Game>)} cb Callback receives an array of Game objects with given name (can be empty).
 */
function searchGames(game, limit, cb) {
    const options = {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': IGDB_AUTHORIZATION_HEADER,
            'Accept': 'application/json'
        },
        content: `${IGDB_BODY_FIELDS_SEARCH} "${game}"; ${IGDB_BODY_FIELDS_LIMIT} ${limit};`
    }
    urllib.request(IGDB_HOST, options, (err, data, res) => {
        if(err) return cb(err)
        const obj = JSON.parse(data)
        cb(null, obj)
    })
}

module.exports = {
    getTopGames,
    searchGames
}