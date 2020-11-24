'use strict'

const db = require('./covida-db')
const igdb = require('./igdb-data')

const DEFAULT_LIMIT = 10

/**
 * @typedef Result
 * @property {Boolean} gameExists
 * @property {Boolean} groupExists
 */

/**
 * Returns an array with limit top games.
 * 
 * @param {Number} limit 
 * @param {function(Error, Array<Game>)} cb 
 */
function getTopGames(limit, cb) {
    igdb.getTopGames(limit || DEFAULT_LIMIT, cb)
}

/**
 * @param {String} game game name
 * @param {Number} limit limit of results
 * @param {function(Error, Array<Game>)} cb Callback receives an array of Game objects with given name (can be empty).
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
 * @param {String} game 
 * @param {function(Error, Result)} cb 
 */
function addGameToGroup(groupName, gameName, cb) {
    const result = {
        gameExists: true,
        groupExists: true
    }

    igdb.searchGames(gameName, 1, (err, games) => {
        if (err) return cb(err)
        if (games.length == 0) {
            result.gameExists = false
            return cb(null, result)
        }

        db.addGame(groupName, gameName, (err, group) => {
            if (err) return cb(err)
            if (!group) {
                result.groupExists = false
            }
            
            cb(null, result)
        })
    })
}

function deleteGameFromGroup(groupName, gameName, cb) {
    const result = {
        gameExists: true,
        groupExists: true
    }

    db.deleteGame(groupName, gameName, (err, group) => {
        
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

}