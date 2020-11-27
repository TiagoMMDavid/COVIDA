/* eslint-disable no-undef */
'use strict'

const GROUPS_PATH = './__tests__/mocks/groups.json'

const groups = require('./../lib/repo/covida-db').init(GROUPS_PATH)
const fs = require('fs')

const EXPECTED_GROUPS = [
    {
        name: 'Favorite',
        description: 'Group for our favorite games',
        games: [ 
            { id: 17269, name: 'Roblox' }, 
            { id: 1905, name: 'Fortnite' }, 
            { id: 135400, name: 'Minecraft' }
        ]
    },
    {
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
        name: 'ToBeEdited',
        description: 'Group to be edited in tests',
        games: []
    },
    {
        name: 'ToBeRemoved',
        description: 'Group to remove game in tests',
        games: [ { id: 1, name: 'Remove me' } ]
    },
    {
        name: 'ToBeAdded',
        description: 'Group to add game in tests',
        games: []
    }
]

test('Test groups module getGroup successfully', done => {
    groups.getGroup('Favorite', (err, group) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        expect(group.description).toBe('Group for our favorite games')
        group.games.forEach((game, i) => {
            expect(game.id).toBe(EXPECTED_GROUPS[0].games[i].id)
            expect(game.name).toBe(EXPECTED_GROUPS[0].games[i].name)
        })
        done()
    })
})

test('Test groups module getGroup for absent group name', done => {
    groups.getGroup('Absent', (err, group) => {
        expect(err).toBeFalsy()
        expect(group).toBeFalsy()
        done()
    })
})

test('Test groups module getGroups successfully', done => {
    groups.getGroups((err, groups) => {
        expect(err).toBeFalsy()

        expect(groups).toBeTruthy()
        groups.slice(0, 2).forEach((group, i) => {
            expect(group.name).toBe(EXPECTED_GROUPS[i].name)
            expect(group.description).toBe(EXPECTED_GROUPS[i].description)
            group.games.forEach((game, j) => {
                expect(game.id).toBe(EXPECTED_GROUPS[i].games[j].id)
                expect(game.name).toBe(EXPECTED_GROUPS[i].games[j].name)
            })
        })

        done()
    })
})

test('Test groups module addGroup successfully', done => {
    groups.addGroup('TestGroup', 'Test Description', (err, group) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('TestGroup')
        expect(group.description).toBe('Test Description')
        expect(group.games.length).toBe(0)
        done()
    })
})

test('Test groups module addGroup with an existing group', done => {
    groups.addGroup('Favorite', 'desc', (err, group) => {
        expect(err).toBeFalsy()
        expect(group).toBeFalsy()
        done()
    })
})

test('Test groups module editGroup successfully', done => {
    groups.editGroup('ToBeEdited', 'newName', 'newDesc', (err, group) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('newName')
        expect(group.description).toBe('newDesc')
        expect(group.games.length).toBe(0)
        done()
    })
})

test('Test groups module editGroup for absent group name', done => {
    groups.editGroup('Absent', 'newName', 'newDesc', (err, group) => {
        expect(err).toBeFalsy()
        expect(group).toBeFalsy()
        done()
    })
})

test('Test groups module getGames successfully', done => {
    groups.getGames('Favorite', (err, games) => {
        expect(err).toBeFalsy()

        expect(games).toBeTruthy()
        games.forEach((game, i) => {
            expect(game.id).toBe(EXPECTED_GROUPS[0].games[i].id)
            expect(game.name).toBe(EXPECTED_GROUPS[0].games[i].name)
        })
        done()
    })
})

test('Test groups module getGames for absent group name', done => {
    groups.getGames('Absent', (err, games) => {
        expect(err).toBeFalsy()
        expect(games).toBeFalsy()
        done()
    })
})

test('Test groups module addGame successfully', done => {
    groups.addGame('ToBeAdded', 2, 'newGame', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('ToBeAdded')
        expect(group.description).toBe('Group to add game in tests')

        expect(group.games[0].id).toBe(2)
        expect(group.games[0].name).toBe('newGame')
        expect(game.id).toBe(2)
        expect(game.name).toBe('newGame')
        done()
    })
})

test('Test groups module addGame for absent group name', done => {
    groups.addGame('Absent', 2, 'game', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeFalsy()
        expect(game).toBeFalsy()
        done()
    })
})

test('Test groups module addGame for duplicate game', done => {
    groups.addGame('Favorite', 17269, 'Roblox', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        expect(game).toBeFalsy()
        done()
    })
})

test('Test groups module deleteGame successfully', done => {
    groups.deleteGame('ToBeRemoved', 1, (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('ToBeRemoved')
        expect(group.description).toBe('Group to remove game in tests')
        expect(group.games.length).toBe(0)
        
        expect(game.id).toBe(1)
        expect(game.name).toBe('Remove me')
        done()
    })
})

test('Test groups module deleteGame for absent group name', done => {
    groups.deleteGame('Absent', 9999, (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeFalsy()
        expect(game).toBeFalsy()
        done()
    })
})

test('Test groups module deleteGame for absent game', done => {
    groups.deleteGame('Favorite', 9999, (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        expect(game).toBeFalsy()
        done()
    })
})

beforeAll(() => {
    fs.writeFileSync(GROUPS_PATH, JSON.stringify(EXPECTED_GROUPS, null, '\t'))
})

afterAll(() => {
    fs.writeFileSync(GROUPS_PATH, JSON.stringify(EXPECTED_GROUPS, null, '\t'))
})