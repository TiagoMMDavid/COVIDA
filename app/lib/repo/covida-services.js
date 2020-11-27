'use strict'

const db = require('./covida-db')
const igdb = require('./igdb-data')

const DEFAULT_LIMIT = 10
const MIN_RATING = 0
const MAX_RATING = 100

/**
 * @typedef Result
 * @property {Boolean} gameExists
 * @property {Boolean} groupExists
 * @property {Boolean} repeatedGame
 */

/**
 * Returns an array with limit top games.
 * 
 * @param {Number} limit 
 * @param {function(Error, Array<GameDetail>)} cb 
 */
function getTopGames(limit, cb) {
    igdb.getTopGames(limit || DEFAULT_LIMIT, cb)
}

/**
 * @param {String} game game name
 * @param {Number} limit limit of results
 * @param {function(Error, Array<GameDetail>)} cb Callback receives an array of Game objects with given name (can be empty).
 */
function searchGames(gameName, limit, cb) {
    igdb.searchGames(gameName, limit || DEFAULT_LIMIT, cb)
}

/**
 * @param {function(Error, Array<Group>)} cb 
 */
function getGroups(cb) {
    db.getGroups(cb)
}

/**
 * @param {String} name 
 * @param {function(Error, Group)} cb 
 */
function getGroup(name, cb) {
    db.getGroup(name, cb)
}

/**
 * Add a new Group object with given name and description if it does not exist yet.
 * Returns an Error if that group already exists.
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
 * Adds a new game to the array of games of the Group with 
 * given name.
 * It does not verify repetitions amongst games.
 * 
 * @param {String} groupName 
 * @param {String} gameName
 * @param {function(Error, Result)} cb 
 */
function addGameToGroup(groupName, gameName, cb) {
    const result = {
        gameExists: true,
        groupExists: undefined,
        repeatedGame: false
    }

    igdb.searchGames(gameName, 1, (err, games) => {
        if (err) return cb(err)
        if (games.length == 0) {
            result.gameExists = false
            return cb(null, result)
        }

        const game = games[0]
        db.addGame(groupName, game.id, game.name, (err, group, game) => {
            if (err) return cb(err)
            result.groupExists = Boolean(group)
            result.repeatedGame = Boolean(!game)

            cb(null, result)
        })
    })
}

/**
 * Deletes a game from the array of games of the Group with 
 * given name.
 * 
 * @param {String} groupName 
 * @param {Integer} gameId 
 * @param {function(Error, Result)} cb 
 */
function deleteGameFromGroup(groupName, gameId, cb) {
    const result = {
        gameExists: undefined,
        groupExists: undefined,
        repeatedGame: undefined
    }

    db.deleteGame(groupName, gameId, (err, group, game) => {
        if (err) return cb(err)
        result.groupExists = Boolean(group)
        result.gameExists = Boolean(game)

        cb(null, result)
    })
}

/**
 * Deletes a game from the array of games of the Group with 
 * given name.
 * 
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
    getGroups,
    getGroup,
    addGroup,
    editGroup,
    addGameToGroup,
    deleteGameFromGroup,
    listGroupGames
}