'use strict'

const db = require('./covida-db')
const igdb = require('./igdb-data')

const DEFAULT_LIMIT = 10
const MIN_RATING = 0
const MAX_RATING = 100

/**
 * @typedef GroupGames
 * @property {Group} group
 * @property {Array<GameDetail>} games
 */

/**
 * Function to get the current top games of IGDB
 * @param {Number} limit limit of results
 * @returns {Promise<Array<GameDetail>>} A promise containing an array of GameDetail objects
 */
function getTopGames(limit) {
    return igdb.getTopGames(limit || DEFAULT_LIMIT)
}

/**
 * Search for games by its name
 * @param {String} game game name
 * @param {Number} limit limit of results
 * @returns {Promise<Array<GameDetail>>} A promise containing an array of GameDetail objects with given name (can be empty)
 */
function searchGames(gameName, limit) {
    return igdb.searchGames(gameName, limit || DEFAULT_LIMIT)
}

/** 
 * Gets the game with given id. 
 * @param {Integer} gameId id of game
 * @returns {Promise<GameDetail>} A promise containing a GameDetail object with given id (can be null)
 */
function getGameById(gameId) {
    if (gameId == null) return Promise.resolve().then(() => null)

    return igdb.getGamesByIds([gameId]).then(games => {
        if (games.length == 0) return null
        return games[0]
    })
}

/** 
 * Gets the games with given ids. The array returned is sorted by rating, from highest to lowest
 * @param {Array<Integer>} ids ids of games
 * @returns {Promise<Array<GameDetail>>} A promise containing an array of GameDetail objects with given ids (can be empty)
 */
function getGamesByIds(gameIds) {
    return igdb.getGamesByIds(gameIds)
}

/**
 * Gets all groups in the database
 * @returns {Promise<Array<Group>} Promise of an array containing every group
 */
function getGroups() {
    return db.getGroups()
        .then(groups => groups.map(group => {
            return {
                id: group.id,
                name: group.name,
                description: group.description
            }
        }))
}

/**
 * Gets the group with the given id
 * @param {String} id 
 * @returns {Promise<Group>} Promise of the group
 */
function getGroup(id) {
    return db.getGroup(id)
}

/**
 * Adds a Group object with given name and description
 * @param {String} name
 * @param {String} description 
 * @returns {Promise<Group>} Promise of the new group
 */
function addGroup(name, description) {
    return db.addGroup(name, description)
}

/**
 * Edits a group by changing its name and description to the given parameters
 * @param {String} id
 * @param {String} newName 
 * @param {String} newDescription
 * @returns {Promise<Group>} Promise of the edited group
 */
function editGroup(id, newName, newDescription) {
    return db.editGroup(id, newName, newDescription)
}

/**
 * Removes the group with given id
 * @param {String} id
 * @returns {Promise<Group>} Promise of the deleted group
 */
function deleteGroup(id) {
    return db.deleteGroup(id)
}

/**
 * Adds a new game to the array of games of the Group with given id
 * If the game already exists in the given group, it is replaced instead
 * @param {String} groupId
 * @param {String} gameName
 * @returns {Promise<Group>} Promise of the group to which the game was added
 */
function addGameToGroup(groupId, gameName, gameId) {
    const groupGame = { 
        'group': null,
        'game': null
    }
    let promise
    if (gameId) {
        promise = getGameById(gameId)
            .then(game => {
                if (!game) return groupGame
                groupGame.game = game
                return game
            })
    } else {
        promise = igdb.searchGames(gameName, 1)
            .then(games => {
                if (games.length == 0) return groupGame
                const game = games[0]

                groupGame.game = game
                return game
            })
    }

    return promise
        .then(game => {
            if (groupGame.game) return db.addGame(groupId, game.id, game.name)
            return groupGame
        })
        .then(group => {
            if (groupGame.game)
                groupGame.group = group

            return groupGame
        })
}

/**
 * Delete a game from the array of games of the Group with given id
 * @param {String} groupId 
 * @param {Integer} gameId 
 * @returns {Promise<GroupGame>} Promise of an object containing the deleted game, and the group from which the game was deleted
 */
function deleteGameFromGroup(groupId, gameId) {
    return db.deleteGame(groupId, gameId)
}

/**
 * Lists the games from a given group ordered by total_rating
 * @param {String} groupId 
 * @param {Number} minRating
 * @param {Number} maxRating  
 * @returns {Promise<GroupGames>)} promise of a GroupGames object, containing the group and its games
 */
function listGroupGames(groupId, minRating, maxRating) {
    minRating = minRating || MIN_RATING
    maxRating = maxRating || MAX_RATING

    const groupGames = { 
        'group': null,
        'games': null
    }

    return db.getGroup(groupId)
        .then(group => {
            if (!group) return groupGames
            
            groupGames.group = group
            if (maxRating < minRating) return groupGames

            let ids = []
            group.games.forEach(game => ids.push(game.id))
            return igdb.getGamesByIds(ids)
        })
        .then(games => {
            if (games != groupGames)
                groupGames.games = games.filter(game => (game.total_rating == null) || (game.total_rating >= minRating && game.total_rating <= maxRating))

            return groupGames
        })
}


module.exports = {
    getTopGames,
    searchGames,
    getGameById,
    getGamesByIds,
    getGroups,
    getGroup,
    addGroup,
    editGroup,
    deleteGroup,
    addGameToGroup,
    deleteGameFromGroup,
    listGroupGames
}