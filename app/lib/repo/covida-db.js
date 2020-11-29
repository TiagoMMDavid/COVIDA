'use strict'

const fs = require('fs')

let groupsPath = './data/groups.json'

/**
 * @typedef Game
 * @property {Integer} id
 * @property {String} name
 */

/**
 * @typedef Group
 * @property {String} name
 * @property {String} description
 * @property {Array<Game>} games Array of strings with games names.
 */

/**
 * @param {String} name 
 * @param {function(Error, Group)} cb 
 */
function getGroup(name, cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if(err) return cb(err)
        const groupArr = JSON.parse(buffer).filter(group => group.name.toLowerCase() == name.toLowerCase())
        if(groupArr.length == 0) return cb(null, null)
        cb(null, groupArr[0])
    })
}

/**
 * @param {function(Error, Array<Group>)} cb 
 */
function getGroups(cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if(err) return cb(err)
        const groups = JSON.parse(buffer)
        cb(null, groups)
    })
}

/**
 * Adds or replaces a Group object with given name and description.
 * @param {String} name
 * @param {String} description 
 * @param {function(Error, Group)} cb
 */
function addGroup(name, description, cb) {
    if (!name) return cb(null, null)
    
    fs.readFile(groupsPath, (err, buffer) => {
        if (err) return cb(err)

        // Filters out group with the same name, for replacement
        const groups = JSON.parse(buffer).filter(group => group.name.toLowerCase() != name.toLowerCase())
        
        // Add new Group
        const newGroup = {'name': name, 'description': description || '', 'games': []}
        groups.push(newGroup)

        fs.writeFile(groupsPath, JSON.stringify(groups, null, '\t'), (err) => {
            if (err) return cb(err)
            cb(null, newGroup)
        })
    })
}

/**
 * Edits a group by changing its name and description to the given parameters
 * @param {String} previousName 
 * @param {String} newName 
 * @param {String} newDescription
 * @param {function(Error, Group)} cb 
 */
function editGroup(previousName, newName, newDescription, cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if(err) return cb(err)
        
        const groupArr = JSON.parse(buffer)
        if (newName) {
            // In case the newName is already in the database, return a Group object with a null name
            if(groupArr.filter(group => group.name.toLowerCase() == newName.toLowerCase()).length != 0) {
                return cb(null, {'name' : null})
            }
        }
        const desiredGroup = groupArr.filter(group => group.name.toLowerCase() == previousName.toLowerCase())
        if(desiredGroup.length == 0) return cb(null, null)
        
        const group = desiredGroup[0]
        group.name = newName || previousName
        group.description = newDescription || group.description

        fs.writeFile(groupsPath, JSON.stringify(groupArr, null, '\t'), (err) => {
            if (err) return cb(err)
            cb(null, group)
        })
    })
}

/**
 * Gets the games for a given group
 * @param {String} groupName
 * @param {function(Error, Array<Game>)} cb 
 */
function getGames(groupName, cb) {
    getGroup(groupName, (err, group) => {
        if(err) return cb(err)
        if(!group) return cb(null, null)
        
        cb(null, group.games)
    })
}

/**
 * Adds a new game to the array of games of the Group with 
 * given name.
 * Repeated games are replaced.
 * 
 * @param {String} groupName 
 * @param {Integer} gameId 
 * @param {String} gameName
 * @param {function(Error, Group)} cb
 */
function addGame(groupName, gameId, gameName, cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if(err) return cb(err)

        const groupArr = JSON.parse(buffer)
        const desiredGroup = groupArr.filter(group => group.name.toLowerCase() == groupName.toLowerCase())
        if(desiredGroup.length == 0) return cb(null, null)
        
        const group = desiredGroup[0]
        group.games = group.games.filter(game => game.id != gameId)

        const game = {
            id: gameId,
            name: gameName
        }
        group.games.push(game)

        fs.writeFile(groupsPath, JSON.stringify(groupArr, null, '\t'), (err) => {
            if (err) return cb(err)
            cb(null, group)
        })
    })
}

/**
 * Delete a game from the array of games of the Group with 
 * given name. Deletes repeated games. 
 * 
 * @param {String} groupName 
 * @param {Integer} gameId 
 * @param {function(Error, Group, Game)} cb
 */
function deleteGame(groupName, gameId, cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if(err) return cb(err)

        const groupArr = JSON.parse(buffer)
        const desiredGroup = groupArr.filter(group => group.name.toLowerCase() == groupName.toLowerCase())
        if(desiredGroup.length == 0) return cb(null, null, null)
        
        const group = desiredGroup[0]
        let removedGame = null
        group.games = group.games.filter(currGame => {
            if(currGame.id == gameId) {
                removedGame = currGame
                return false
            }
            return true
        })

        if (!removedGame) return cb(null, group, null)
        fs.writeFile(groupsPath, JSON.stringify(groupArr, null, '\t'), (err) => {
            if (err) return cb(err)
            cb(null, group, removedGame)
        })
    })
}

function init(path) {
    if(path) groupsPath = path
    return API
}

const API = {
    init,
    getGroup,
    getGroups,
    addGroup,
    editGroup,
    getGames,
    addGame,
    deleteGame
}

module.exports = API