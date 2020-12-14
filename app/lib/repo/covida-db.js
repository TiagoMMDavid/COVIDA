'use strict'
const fetch = require('node-fetch')

/**
 * @typedef Group
 * @property {String} id
 * @property {String} name
 * @property {String} description
 * @property {Array<Game>} games
 */

/**
 * @typedef Game
 * @property {Integer} id
 * @property {String} name
 */

/**
 * @typedef GroupGame
 * @property {Group} group
 * @property {Game} game
 */

/**
 * @typedef ElasticSearchInfo
 * @property {String} host
 * @property {String} port
 * @property {String} groupsIndex
 */

class Groups {
    /**
     * @param {ElasticSearchInfo} es Info about the ElasticSearch server
     */
    constructor(es) {
        this.urlGroup = `http://${es.host}:${es.port}/${es.groupsIndex}/_doc/`
        this.urlGroupsList = `http://${es.host}:${es.port}/${es.groupsIndex}/_search/`
    }

    /**
     * @param {ElasticSearchInfo} es Info about the ElasticSearch server
     */
    static init(es) {
        return new Groups(es)
    }

    /**
     * Gets all groups in the database
     * @returns {Promise<Array<Group>} Promise of an array containing every group
     */
    getGroups() {
        console.log(this.urlGroup)
        
        return fetch(this.urlGroupsList)
            .then(res => res.json())
            .then(json => {
                if (json.status == 404) return null
                return json.hits.hits
            })
            .then(groups => {
                const groupArr = []
                if (groups == null) return groupArr

                groups.forEach(group => {
                    const parsedGroup = {
                        'id': group._id,
                        'name': group._source.name,
                        'description': group._source.description,
                        'games': group._source.games
                    }
                    groupArr.push(parsedGroup)
                })
                return groupArr
            })
    }

    /**
     * Gets the group with the given id
     * @param {String} id 
     * @returns {Promise<Group>} Promise of a Group
     */
    getGroup(id) {
        return fetch(`${this.urlGroup}${id}`)
            .then(res => res.json())
            .then(group => {
                if (!group.found) return null
                const parsedGroup = {
                    'id': group._id,
                    'name': group._source.name,
                    'description': group._source.description,
                    'games': group._source.games
                }
                return parsedGroup
            })
    }

    /**
     * Adds a Group object with given name and description
     * @param {String} name
     * @param {String} description 
     * @returns {Promise<Group>}
     */
    addGroup(name, description) {
        if (!name) return Promise.resolve().then(() => null)
        const newGroup = {'name': name, 'description': description || '', 'games': []}

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newGroup)
        }

        return fetch(this.urlGroup, options)
            .then(res => res.json())
            .then(group => {
                newGroup.id = group._id
                return newGroup
            })
    }

    /**
     * Edits a group by changing its name and description to the given parameters
     * @param {String} id
     * @param {String} newName 
     * @param {String} newDescription
     * @returns {Promise<Group>}
     */
    editGroup(id, newName, newDescription) {
        return this.getGroup(id)
            .then(group => {
                if (!group) return null
                group.name = newName || group.name
                group.description = newDescription || group.description
                delete group.id // Remove id from _source

                const options = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(group)
                }

                return fetch(`${this.urlGroup}${id}`, options)
                    .then(res => res.json())
                    .then(json => {
                        if (json.result == 'updated') {
                            group.id = id
                            return group
                        } 
                        return null
                    })
            })
    }

    /**
     * Removes the group with given id
     * @param {String} id
     * @returns {Promise<Group>} 
     */
    deleteGroup(id) {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }

        return this.getGroup(id)
            .then(group =>
                fetch(`${this.urlGroup}${id}`, options)
                    .then(res => res.json())
                    .then(json => {
                        if (json.result == 'deleted') return group
                        return null
                    }))
    }

    /**
     * Gets the games for a given group
     * @param {String} groupId
     * @returns {Promise<Game>}
     */
    getGames(groupId) {
        return this.getGroup(groupId)
            .then(group => {
                if (!group) return null
                return group.games
            })
    }

    /**
     * Adds a new game to the array of games of the Group with given name
     * If the gameId already exists in the given group, it is replaced instead
     * @param {String} groupId 
     * @param {Integer} gameId 
     * @param {String} gameName
     * @returns {Promise<Group>}
     */
    addGame(groupId, gameId, gameName) {
        return this.getGroup(groupId)
            .then(group => {
                if (!group) return null
                group.games = group.games.filter(game => game.id != gameId)

                const game = {
                    id: gameId,
                    name: gameName
                }
                group.games.push(game)
                delete group.id // Remove id from _source

                const options = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(group)
                }

                return fetch(`${this.urlGroup}${groupId}`, options)
                    .then(res => res.json())
                    .then(json => {
                        if (json.result == 'updated') {
                            group.id = groupId
                            return group
                        } 
                        return null
                    })
            })
    }

    /**
     * Delete a game from the array of games of the Group with given name
     * @param {String} groupId 
     * @param {Integer} gameId 
     * @returns {Promise<GroupGame>}
     */
    deleteGame(groupId, gameId) {
        return this.getGroup(groupId)
            .then(group => {
                const groupGame = { 
                    'group': null,
                    'game': null
                }

                // Return if group does not exist
                if (!group) return groupGame
                groupGame.group = group

                let removedGame = null
                group.games = group.games.filter(currGame => {
                    if(currGame.id == gameId) {
                        removedGame = currGame
                        return false
                    }
                    return true
                })

                // Check if group contained game
                if (!removedGame) return groupGame

                // Delete game
                delete group.id // Remove id from _source
                const options = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(group)
                }

                return fetch(`${this.urlGroup}${groupId}`, options)
                    .then(res => res.json())
                    .then(json => {
                        if (json.result == 'updated') {
                            group.id = groupId
                            groupGame.game = removedGame
                            return groupGame
                        } 
                        return null
                    })

            })
    }
}

module.exports = Groups