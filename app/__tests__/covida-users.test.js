/* eslint-disable no-undef */
'use strict'

const es = {
    host: 'localhost',
    port: '9200',
    groupsIndex: 'users-groups-db-tests',
    usersIndex: 'users-db-tests'
}

const fetch = require('node-fetch')
const users = require('./../lib/repo/covida-users').init(es.usersIndex)

const EXPECTED_GROUPS = [
    {
        id: '1',
        name: 'Favorite',
        description: 'Group for our favorite games',
        games: [ 
            { id: 17269, name: 'Roblox' }, 
            { id: 1905, name: 'Fortnite' }, 
            { id: 135400, name: 'Minecraft' }
        ]
    },
    {
        id: '2',
        name: 'eSports',
        description: 'Professional competitive games',
        games: [
            { id: 1372, name: 'Counter-Strike: Global Offensive' },
            { id: 126459, name: 'Valorant' }, 
            { id: 115, name: 'League of Legends' }, 
            { id: 8173, name: 'Overwatch' }, 
            { id: 11198, name: 'Rocket League' }
        ]
    },
    {
        id: '3',
        name: 'ToBeEdited',
        description: 'Group to be edited in tests',
        games: []
    },
    {
        id: '7',
        name: 'ToBeRemovedGroup',
        description: 'Group to be removed in tests',
        games: []
    }
]

const EXPECTED_USERS = [
    {
        username: 'user1',
        password: 'mysecretpassword',
        groups: [ 
            { id: 1, name: 'Favorite' },
            { id: 3, name: 'ToBeEdited'}
        ]
    },
    {
        username: 'deleteuser',
        password: 'mysecretpassword',
        groups: []
    },
    {
        username: 'adduser',
        password: 'mysecretpassword',
        groups: []
    },
    {
        username: 'removeuser',
        password: 'mysecretpassword',
        groups: [ 
            { id: 1, name: 'Favorite' }
        ]
    },
    {
        username: 'edituser',
        password: 'mysecretpassword',
        groups: [ 
            { id: 1, name: 'Favorite' }
        ]
    }
]

function getBulkBodyStringGroups() {
    let bodyString = ''
    EXPECTED_GROUPS.forEach((group) => {
        bodyString += `{ "index" : { "_id" : "${group.id}" } }\n`
        const noIdGroup = {
            name: group.name,
            description: group.description,
            games: group.games
        }
        bodyString += `${JSON.stringify(noIdGroup)}\n`
    })

    return bodyString   
}


function getBulkBodyStringUsers() {
    let bodyString = ''
    EXPECTED_USERS.forEach((user) => {
        bodyString += `{ "index" : { "_id" : "${user.username}" } }\n`
        bodyString += `${JSON.stringify(user)}\n`
    })

    return bodyString   
}

beforeAll(() => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: getBulkBodyStringGroups()
    }

    return fetch(`http://${es.host}:${es.port}/${es.groupsIndex}/_doc/_bulk/?refresh`, options).then(() => {
        options.body = getBulkBodyStringUsers()

        return fetch(`http://${es.host}:${es.port}/${es.usersIndex}/_doc/_bulk/?refresh`, options)
    })
})


test('Test users module getUser successfully', () => {
    return users.getUser('user1')
        .then(user => {
            expect(user).toBeTruthy()
            expect(user.username).toBe('user1')
            expect(user.password).toBe('mysecretpassword')

            user.groups.forEach((group, i) => {
                expect(group.id).toBe(EXPECTED_USERS[0].groups[i].id)
                expect(group.name).toBe(EXPECTED_USERS[0].groups[i].name)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})


test('Test users module getUser for absent username', () => {
    return users.getUser('notexist')
        .then(user => {
            expect(user).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module addUser successfully', () => {
    return users.addUser('newUser', 'secretPassword')
        .then(user => {
            expect(user).toBeTruthy()
            expect(user.username).toBe('newUser')
            expect(user.password).toBe('secretPassword')
            expect(user.groups.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module addUser with an already existing username', () => {
    return users.addUser('user1', 'password')
        .then(user => {
            expect(user).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module addUser with null username', () => {
    return users.addUser(null, 'N/A')
        .then(user => expect(user).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module addUser with null password', () => {
    return users.addUser('N/A', null)
        .then(user => expect(user).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module deleteUser successfully', () => {
    return users.deleteUser('deleteuser')
        .then(username => {
            expect(username).toBeTruthy()
            expect(username).toBe('deleteuser')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module deleteUser for absent user', () => {
    return users.deleteUser('N/A')
        .then(username => expect(username).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module addGroup successfully', () => {
    return users.addGroup('addUser', 1, 'Favorite')
        .then(user => {
            expect(user).toBeTruthy()
            expect(user.username).toBe('adduser')
            expect(user.password).toBe('mysecretpassword')

            expect(user.groups[0].id).toBe(1)
            expect(user.groups[0].name).toBe('Favorite')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module addGroup for absent user', () => {
    return users.addGroup('N/A', 1, 'Favorite')
        .then(user => expect(user).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module deleteGroup successfully', () => {
    return users.removeGroup('removeUser', 1)
        .then(user => {
            expect(user).toBeTruthy()
            expect(user.username).toBe('removeuser')
            expect(user.password).toBe('mysecretpassword')
            expect(user.groups.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module deleteGroup for absent user', () => {
    return users.removeGroup('N/A', 1)
        .then(user => expect(user).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module editGroup successfully', () => {
    return users.editGroup('editUser', 1, 'NewFavorite')
        .then(user => {
            expect(user).toBeTruthy()
            expect(user.username).toBe('edituser')
            expect(user.password).toBe('mysecretpassword')
            expect(user.groups[0].id).toBe(1)
            expect(user.groups[0].name).toBe('NewFavorite')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module editGroup for absent group', () => {
    return users.editGroup('editUser', 10, 'N/A')
        .then(user => expect(user).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test users module editGroup for absent user', () => {
    return users.editGroup('N/A', 1, 'NewFavorite')
        .then(user => expect(user).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

afterAll(() => {
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }

    return fetch(`http://${es.host}:${es.port}/${es.groupsIndex}/`, options).then(() =>
        fetch(`http://${es.host}:${es.port}/${es.usersIndex}/`, options)
    )
})