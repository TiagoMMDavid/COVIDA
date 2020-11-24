'use strict'

const fs = require('fs')

let groupsPath = './data/groups.json'

/**
 * @typedef Group
 * @property {String} name
 * @property {String} description
 * @property {Array} games Array of strings with games names.
 */

/**
 * @param {String} name 
 * @param {function(Error, Group)} cb 
 */
function getGroup(name, cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if(err) return cb(err)
        const groupArr = JSON.parse(buffer).filter(group => group.name == name)
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
 * Add a new Group object with given name and description if it does not exist yet.
 * Returns an Error if that group already exists.
 * @param {String} name
 * @param {String} description 
 * @param {function(Error, Group)} cb
 */
function addGroup(name, description, cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if (err) return cb(err)

        const groups = JSON.parse(buffer)

        // Check if group already exists
        if (groups.filter(group => group.name == name).length != 0)
            return cb(null, null)

        // Add new Group
        const newGroup = {'name': name, 'description': description, 'games': []}
        groups.push(newGroup)

        fs.writeFile(groupsPath, JSON.stringify(groups, null, '\t'), (err) => {
            if (err) cb(err)
            else cb(null, newGroup)
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
        const desiredGroup = groupArr.filter(group => group.name == previousName)
        if(desiredGroup.length == 0) return cb(null, null)
        
        const group = desiredGroup[0]
        group.name = newName
        group.description = newDescription

        fs.writeFile(groupsPath, JSON.stringify(groupArr, null, '\t'), (err) => {
            if (err) cb(err)
            cb(null, group)
        })
    })
}

/**
 * Gets the games for a given group
 * @param {String} groupName
 * @param {function(Error, Array<String>)} cb 
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
 * It does not verify repetitions among games.
 * 
 * @param {String} groupName 
 * @param {String} game 
 * @param {function(Error, Group)} cb 
 */
function addGame(groupName, game, cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if(err) return cb(err)

        const groupArr = JSON.parse(buffer)
        const desiredGroup = groupArr.filter(group => group.name == groupName)
        if(desiredGroup.length == 0) return cb(null, null)
        
        const group = desiredGroup[0]
        group.games.push(game)
        fs.writeFile(groupsPath, JSON.stringify(groupArr, null, '\t'), (err) => {
            if (err) cb(err)
            cb(null, group)
        })
    })
}

/**
 * Delte a game from the array of games of the Group with 
 * given name.
 * 
 * @param {String} groupName 
 * @param {String} game 
 * @param {function(Error, Group)} cb 
 */
function deleteGame(groupName, game, cb) {
    fs.readFile(groupsPath, (err, buffer) => {
        if(err) return cb(err)

        const groupArr = JSON.parse(buffer)
        const desiredGroup = groupArr.filter(group => group.name == groupName)
        if(desiredGroup.length == 0) return cb(null, null)
        
        const group = desiredGroup[0]
        group.games = group.games.filter(currGame => currGame != game)
        fs.writeFile(groupsPath, JSON.stringify(groupArr, null, '\t'), (err) => {
            if (err) cb(err)
            cb(null, group)
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