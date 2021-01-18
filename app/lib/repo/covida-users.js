'use strict'
const fetch = require('node-fetch')

const es = {
    host: 'localhost',
    port: '9200',
    usersIndex: 'covida-users'
}

// Variables only changed in init
let URL_USERS = `http://${es.host}:${es.port}/${es.usersIndex}/_doc/`

/**
 * @typedef User
 * @property {String} username 
 * @property {String} password
 * @property {Array<Group>} groups
 */

/**
 * @returns {Promise<User>}
 */
function addUser(username, password) {
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
        
            return fetch(`${URL_USERS}${username}?refresh`, options)
                .then(res => toAdd)
        })    
}

/**
 * @returns {Promise<User>}
 */
function getUser(username) {
    return fetch(`${URL_USERS}${username}`)
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
 * @returns {Promise<User>}
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

            return fetch(`${URL_USERS}${username}?refresh`, options)
                .then(res => user)
        })
}

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

            return fetch(`${URL_USERS}${username}?refresh`, options)
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
    addGroup,
    removeGroup
}

module.exports = API