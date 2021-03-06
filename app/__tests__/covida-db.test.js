/* eslint-disable no-undef */
'use strict'

const es = {
    host: 'localhost',
    port: '9200',
    groupsIndex: 'groups-db-tests'
}

const fetch = require('node-fetch')
const groups = require('./../lib/repo/covida-db').init(es.groupsIndex)

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
        id: '4',
        name: 'ToBeRemoved',
        description: 'Group to remove game in tests',
        games: [ { id: 1, name: 'Remove me' } ]
    },
    {
        id: '5',
        name: 'ToBeAdded',
        description: 'Group to add game in tests',
        games: []
    },
    {
        id: '6',
        name: 'ToBeReplaced',
        description: 'Group to replace in tests',
        games: []
    },
    {
        id: '7',
        name: 'ToBeRemovedGroup',
        description: 'Group to be removed in tests',
        games: []
    }
]

function getBulkBodyString() {
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

beforeAll(() => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: getBulkBodyString()
    }

    return fetch(`http://${es.host}:${es.port}/${es.groupsIndex}/_doc/_bulk/?refresh`, options)
})


test('Test groups module getGroup successfully', () => {
    return groups.getGroup('1')
        .then(group => {
            expect(group).toBeTruthy()
            expect(group.id).toBe('1')
            expect(group.name).toBe('Favorite')
            expect(group.description).toBe('Group for our favorite games')

            group.games.forEach((game, i) => {
                expect(game.id).toBe(EXPECTED_GROUPS[0].games[i].id)
                expect(game.name).toBe(EXPECTED_GROUPS[0].games[i].name)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})


test('Test groups module getGroup for absent group id', () => {
    return groups.getGroup('0')
        .then(group => {
            expect(group).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})


test('Test groups module getGroups successfully', () => {
    return groups.getGroups()
        .then(groups => {
            expect(groups).toBeTruthy()

            expect(groups.length).toBeGreaterThan(0)
            groups.slice(0, 2).forEach((group, i) => {
                expect(group.id).toBe(EXPECTED_GROUPS[i].id)
                expect(group.name).toBe(EXPECTED_GROUPS[i].name)
                expect(group.description).toBe(EXPECTED_GROUPS[i].description)

                group.games.forEach((game, j) => {
                    expect(game.id).toBe(EXPECTED_GROUPS[i].games[j].id)
                    expect(game.name).toBe(EXPECTED_GROUPS[i].games[j].name)
                })
            })
        })
        .catch(err => expect(err).toBeFalsy())
})


test('Test groups module addGroup successfully', () => {
    return groups.addGroup('TestGroup', 'Test Description')
        .then(group => {
            expect(group).toBeTruthy()
            expect(group.name).toBe('TestGroup')
            expect(group.description).toBe('Test Description')
            expect(group.games.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module addGroup with an already existing group name', () => {
    return groups.addGroup('ToBeReplaced', 'New description')
        .then(group => {
            expect(group).toBeTruthy()
            expect(group.id).not.toBe('6')
            expect(group.name).toBe('ToBeReplaced')
            expect(group.description).toBe('New description')
            expect(group.games.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module addGroup with null id', () => {
    return groups.addGroup(null, 'N/A')
        .then(group => expect(group).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module editGroup successfully', () => {
    return groups.editGroup('3', 'newName', 'newDesc')
        .then(group => {
            expect(group).toBeTruthy()
            expect(group.id).toBe('3')
            expect(group.name).toBe('newName')
            expect(group.description).toBe('newDesc')
            expect(group.games.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module editGroup for absent group id', () => {
    return groups.editGroup('0', 'N/A', 'N/A')
        .then(group => expect(group).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module deleteGroup successfully', () => {
    return groups.deleteGroup('7')
        .then(group => {
            expect(group).toBeTruthy()

            expect(group.id).toBe('7')
            expect(group.name).toBe('ToBeRemovedGroup')
            expect(group.description).toBe('Group to be removed in tests')
            expect(group.games.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module deleteGroup for absent group id', () => {
    return groups.deleteGroup('0')
        .then(group => expect(group).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module getGames successfully', () => {
    return groups.getGames('1')
        .then(games => {
            expect(games).toBeTruthy()
            games.forEach((game, i) => {
                expect(game.id).toBe(EXPECTED_GROUPS[0].games[i].id)
                expect(game.name).toBe(EXPECTED_GROUPS[0].games[i].name)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module getGames for absent group id', () => {
    return groups.getGames('0')
        .then(games => expect(games).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module addGame successfully', () => {
    return groups.addGame('5', 2, 'newGame')
        .then(group => {
            expect(group).toBeTruthy()
            expect(group.id).toBe('5')
            expect(group.name).toBe('ToBeAdded')
            expect(group.description).toBe('Group to add game in tests')

            expect(group.games[0].id).toBe(2)
            expect(group.games[0].name).toBe('newGame')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module addGame for absent group id', () => {
    return groups.addGame('0', 2, 'game')
        .then(group => expect(group).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module addGame for duplicate game', () => {
    return groups.addGame('1', 17269, 'Roblox')
        .then(group => {
            expect(group).toBeTruthy()
            expect(group.id).toBe('1')
            expect(group.name).toBe('Favorite')

            const filteredGames = group.games.filter(game => game.id == 17269)
            expect(filteredGames.length).toBe(1)
            expect(filteredGames[0].id).toBe(17269)
            expect(filteredGames[0].name).toBe('Roblox')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module deleteGame successfully', () => {
    return groups.deleteGame('4', 1)
        .then(groupGame => {
            expect(groupGame).toBeTruthy()
            const group = groupGame.group
            const game = groupGame.game

            expect(group).toBeTruthy()
            expect(group.id).toBe('4')
            expect(group.name).toBe('ToBeRemoved')
            expect(group.description).toBe('Group to remove game in tests')
            expect(group.games.length).toBe(0)
            
            expect(game).toBeTruthy()
            expect(game.id).toBe(1)
            expect(game.name).toBe('Remove me')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module deleteGame for absent group id', () => {
    return groups.deleteGame('0', 9999)
        .then(groupGame => {
            expect(groupGame.group).toBeFalsy()
            expect(groupGame.game).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module deleteGame for absent game', () => {
    return groups.deleteGame('1', 9999)
        .then(groupGame => {
            expect(groupGame).toBeTruthy()
            const group = groupGame.group
            const game = groupGame.game

            expect(group).toBeTruthy()
            expect(group.id).toBe('1')
            expect(group.name).toBe('Favorite')
            expect(game).toBeFalsy()
        })
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

    return fetch(`http://${es.host}:${es.port}/${es.groupsIndex}/`, options)
})