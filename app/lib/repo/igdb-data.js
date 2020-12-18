'use strict'

const fetch = require('node-fetch')

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
 * @returns {Promise<Array<GameDetail>>} A promise containing an array of GameDetail objects
 */
function getTopGames(limit) {
    if (limit > IGDB_MAX_LIMIT || limit < 0) {
        return Promise.resolve().then(() => null)
    }
    
    const options = {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': IGDB_AUTHORIZATION_HEADER,
            'Accept': 'application/json'
        },
        body: `${IGDB_COMMON_BODY_FIELDS} ${IGDB_TOP_GAMES} ${IGDB_BODY_FIELDS_LIMIT} ${limit};`
    }

    return fetch(IGDB_HOST, options).then(res => res.json())
}

/**
 * Search for games by its name
 * @param {String} game game name
 * @param {Number} limit limit of results
 * @returns {Promise<Array<GameDetail>>} A promise containing an array of GameDetail objects with given name (can be empty)
 */
function searchGames(game, limit) {
    if (limit > IGDB_MAX_LIMIT || limit < 0) {
        return Promise.resolve().then(() => null)
    }

    const options = {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID,
            'Authorization': IGDB_AUTHORIZATION_HEADER,
            'Accept': 'application/json'
        },
        body: `${IGDB_COMMON_BODY_FIELDS} ${IGDB_SEARCH} "${game}"; ${IGDB_BODY_FIELDS_LIMIT} ${limit};`
    }

    return fetch(IGDB_HOST, options).then(res => res.json())
}

/** 
 * Gets the games with given ids. The array returned is sorted by rating, from highest to lowest
 * @param {Array<Integer>} ids ids of games
 * @returns {Promise<Array<GameDetail>>} A promise containing an array of GameDetail objects with given ids (can be empty)
 */
function getGamesByIds(ids) {
    if (!ids || ids.length == 0)
        return Promise.resolve().then(() => [])

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
        body: `${IGDB_COMMON_BODY_FIELDS} ${IGDB_GET_GAMES_BY_IDS} ${formattedIds};`
    }
    
    return fetch(IGDB_HOST, options).then(res => res.json())
}

module.exports = {
    getTopGames,
    searchGames,
    getGamesByIds
}