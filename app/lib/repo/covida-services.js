'use strict'

const db = require('./covida-db')
const igdb = require('./igdb-data')

const DEFAULT_LIMIT = 10
const MIN_RATING = 0
const MAX_RATING = 100

/**
 * Function to get the current top games of IGDB
 * @param {Number} limit limit of results
 * @returns A promise containing an array of GameDetail or Error if not succeeded
 */
function getTopGames(limit) {
    return igdb.getTopGames(limit || DEFAULT_LIMIT)
}

/**
 * Search for games by its name
 * @param {String} game game name
 * @param {Number} limit limit of results
 * @returns {Promise} A promise containing an array of GameDetail objects with given name (can be empty)
 */
function searchGames(gameName, limit) {
    return igdb.searchGames(gameName, limit || DEFAULT_LIMIT)
}

/** 
 * Gets the game with given id. 
 * @param {Integer} gameId id of game
 * @returns {Promise} A promise containing a GameDetail object with given ids (can be null)
 */
function getGameById(gameId) {
    if (!gameId) return Promise.resolve().then(() => null)

    return igdb.getGamesByIds([gameId]).then(games => {
        if (games.length == 0) return null
        return games[0]
    })
}

/**
 * Gets all groups in the database
 * @param {function(Error, Array<Group>)} cb 
 */
function getGroups(cb) {
    db.getGroups((err, groups) => {
        if (err) return cb(err)
        groups = groups.map(group => {
            return {
                name: group.name,
                description: group.description
            }
        })
        cb(null, groups)
    })
}

/**
 * Gets the group with the given name
 * @param {String} name 
 * @param {function(Error, Group)} cb 
 */
function getGroup(name, cb) {
    db.getGroup(name, cb)
}

/**
 * Adds or replaces a Group object with given name and description
 * @param {String} name
 * @param {String} description 
 * @param {function(Error, Group)} cb
 */
function addGroup(name, description, cb) {
    db.addGroup(name, description, cb)
}

/**
 * Edits a group by changing its name and description to the given parameters
 * @param {String} previousName 
 * @param {String} newName 
 * @param {String} newDescription
 * @param {function(Error, Group)} cb 
 */
function editGroup(previousName, newName, newDescription, cb) {
    db.editGroup(previousName, newName, newDescription, cb)
}

/**
 * Adds a new game to the array of games of the Group with given name
 * If the game already exists in the given group, it is replaced instead
 * If the game doesn't exist the callback function receives every parameter as null
 * @param {String} groupName 
 * @param {String} gameName
 * @param {function(Error, Group, Game)} cb
 */
function addGameToGroup(groupName, gameName, cb) {
    igdb.searchGames(gameName, 1, (err, games) => {
        if (err) return cb(err)
        if (games.length == 0) {
            return cb(null, null, null)
        }

        const game = games[0]
        db.addGame(groupName, game.id, game.name, (err, group) => {
            if (err) return cb(err)
            cb(null, group, game)
        })
    })
}

/**
 * Delete a game from the array of games of the Group with given name
 * @param {String} groupName 
 * @param {Integer} gameId 
 * @param {function(Error, Group, Game)} cb
 */
function deleteGameFromGroup(groupName, gameId, cb) {
    db.deleteGame(groupName, gameId, cb)
}

/**
 * Lists the games from a given group ordered by total_rating
 * @param {String} groupName 
 * @param {Number} minRating
 * @param {Number} maxRating  
 * @param {function(Error, Group, Array<GameDetail>)} cb 
 */
function listGroupGames(groupName, minRating, maxRating, cb) {
    minRating = minRating || MIN_RATING
    maxRating = maxRating || MAX_RATING

    db.getGroup(groupName, (err, group) => {
        if (err) return cb(err)

        if (!group) {
            return cb(null, null, null)
        }
        
        if (maxRating < minRating) {
            return cb(null, group, null)
        }

        let ids = []
        group.games.forEach(game => ids.push(game.id))

        igdb.getGamesByIds(ids, (err, games) => {
            if (err) return cb(err)
            cb(null, group, games.filter(game => game.total_rating >= minRating && game.total_rating <= maxRating))
        })
    })
}


module.exports = {
    getTopGames,
    searchGames,
    getGameById,
    getGroups,
    getGroup,
    addGroup,
    editGroup,
    addGameToGroup,
    deleteGameFromGroup,
    listGroupGames
}