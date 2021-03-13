'use strict'
const fetch = require('node-fetch')

const es = {
    host: 'localhost',
    port: '9200',
    usersIndex: 'covida-users'
}

// Variable changed in init
let URL_USERS = `http://${es.host}:${es.port}/${es.usersIndex}/_doc/`

/**
 * @typedef User
 * @property {String} username 
 * @property {String} password
 * @property {Array<Group>} groups
 */


/**
 * Adds a user with given username and password
 * @param {String} username 
 * @param {String} password 
 * @returns {Promise<User>} Promise of a user
 */
function addUser(username, password) {
    if (!username || !password)
        return Promise.resolve().then(() => null)

    return getUser(username)
        .then(user => {
            if (user) return null
            
            const toAdd = {
                'username': username,
                'password': password,
                'groups': []
            }

            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(toAdd)
            }
        
            return fetch(`${URL_USERS}${encodeURIComponent(username.toLowerCase())}?refresh`, options)
                .then(res => toAdd)
        })
}

/**
 * Deletes a user with the given username
 * @param {String} username 
 * @returns {Promise<String>} Promise of a username. Used to confirm deletion
 */
function deleteUser(username) {
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }

    return fetch(`${URL_USERS}${encodeURIComponent(username.toLowerCase())}?refresh`, options)
        .then(res => res.json())
        .then(json => {
            if (json.result == 'deleted') return username
            return null
        })
}

/**
 * Gets the user with the given username
 * @param {String} username 
 * @returns {Promise<User>} Promise of a user
 */
function getUser(username) {
    return fetch(`${URL_USERS}${encodeURIComponent(username.toLowerCase())}`)
        .then(res => res.json())
        .then(user => {
            if (!user.found) return null
            const parsedUser = {
                'username': user._source.username,
                'password': user._source.password,
                'groups': user._source.groups
            }

            return parsedUser
        })
}

/**
 * Adds a group to the array of groups of the user with given username
 * @param {String} username
 * @param {String} groupId
 * @param {String} groupName 
 * @returns {Promise<User>} Promise of a user
 */
function addGroup(username, groupId, groupName) {
    return getUser(username)
        .then(user => {
            if (!user) return null

            const toAdd = {
                'id': groupId,
                'name': groupName
            }

            user.groups.push(toAdd)

            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(user)
            }

            return fetch(`${URL_USERS}${encodeURIComponent(username.toLowerCase())}?refresh`, options)
                .then(res => user)
        })
}

/**
 * Edits a group from the array of groups of the user with given username
 * @param {String} username
 * @param {String} groupId
 * @param {String} newGroupName 
 * @returns {Promise<User>} Promise of a user
 */
function editGroup(username, groupId, newGroupName) {
    return getUser(username)
        .then(user => {
            if (!user) return null

            const filteredGroups = user.groups.filter(group => group.id == groupId)
            if (filteredGroups.length == 0) return null

            filteredGroups[0].name = newGroupName

            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(user)
            }

            return fetch(`${URL_USERS}${encodeURIComponent(username.toLowerCase())}?refresh`, options)
                .then(res => user)
        })
}

/**
 * Removes a group from the array of groups of the user with given username
 * @param {String} username
 * @param {String} groupId
 * @returns {Promise<User>} Promise of a user
 */
function removeGroup(username, groupId) {
    return getUser(username)
        .then(user => {
            if (!user) return null

            user.groups = user.groups.filter(group => group.id != groupId)

            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(user)
            }

            return fetch(`${URL_USERS}${encodeURIComponent(username.toLowerCase())}?refresh`, options)
                .then(res => user)
        })
}

/**
 * @param {String} index Index to use in the ElasticSearch server
 */
function init(index) {
    if (index) {
        es.usersIndex = index
        URL_USERS = `http://${es.host}:${es.port}/${es.usersIndex}/_doc/`
    }
    return API
}

const API = {
    init,
    getUser,
    addUser,
    deleteUser,
    addGroup,
    editGroup,
    removeGroup
}

module.exports = API