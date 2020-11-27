/* eslint-disable no-undef */
'use strict'

const GROUPS_PATH = './__tests__/mocks/groups.json'

const groups = require('./../lib/repo/covida-db').init(GROUPS_PATH)
const fs = require('fs')

const EXPECTED_GROUPS = [
    {
        name: 'Favorite',
        description: 'Group for our favorite games',
        games: ['Roblox', 'Fortnite', 'Minecraft']
    },
    {
        name: 'eSports',
        description: 'Professional competitive games',
        games: ['Counter-Strike: Global Offensive', 'Valorant', 'League of Legends', 'Overwatch', 'Rocket League']
    },
    {
        name: 'ToBeEdited',
        description: 'Group to be edited in tests',
        games: []
    },
    {
        name: 'ToBeRemoved',
        description: 'Group to remove game in tests',
        games: ['Remove me']
    },
    {
        name: 'ToBeAdded',
        description: 'Group to add game in tests',
        games: []
    }
]

test('Test groups module getGroup successfuly', done => {
    groups.getGroup('Favorite', (err, group) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        expect(group.description).toBe('Group for our favorite games')
        group.games.forEach((game, i) => {
            expect(game).toBe(EXPECTED_GROUPS[0].games[i])
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

test('Test groups module getGroups successfuly', done => {
    groups.getGroups((err, groups) => {
        expect(err).toBeFalsy()

        expect(groups).toBeTruthy()
        groups.slice(0, 2).forEach((group, i) => {
            expect(group.name).toBe(EXPECTED_GROUPS[i].name)
            expect(group.description).toBe(EXPECTED_GROUPS[i].description)
            group.games.forEach((game, j) => {
                expect(game).toBe(EXPECTED_GROUPS[i].games[j])
            })
        })

        done()
    })
})

test('Test groups module addGroup successfuly', done => {
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

test('Test groups module editGroup successfuly', done => {
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

test('Test groups module getGames successfuly', done => {
    groups.getGames('Favorite', (err, games) => {
        expect(err).toBeFalsy()

        expect(games).toBeTruthy()
        games.forEach((game, i) => {
            expect(game).toBe(EXPECTED_GROUPS[0].games[i])
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

test('Test groups module addGame successfuly', done => {
    groups.addGame('ToBeAdded', 'newGame', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('ToBeAdded')
        expect(group.description).toBe('Group to add game in tests')
        expect(group.games[0]).toBe('newGame')
        expect(game).toBe('newGame')
        done()
    })
})

test('Test groups module addGame for absent group name', done => {
    groups.addGame('Absent', 'game', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeFalsy()
        expect(game).toBeFalsy()
        done()
    })
})

test('Test groups module addGame for duplicate game', done => {
    groups.addGame('Favorite', 'Roblox', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        expect(game).toBeFalsy()
        done()
    })
})

test('Test groups module deleteGame successfuly', done => {
    groups.deleteGame('ToBeRemoved', 'Remove me', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('ToBeRemoved')
        expect(group.description).toBe('Group to remove game in tests')
        expect(group.games.length).toBe(0)
        
        expect(game).toBe('Remove me')
        done()
    })
})

test('Test groups module deleteGame for absent group name', done => {
    groups.deleteGame('Absent', 'game', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeFalsy()
        expect(game).toBeFalsy()
        done()
    })
})

test('Test groups module deleteGame for absent game', done => {
    groups.deleteGame('Favorite', 'Absent', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        expect(game).toBeFalsy()
        done()
    })
})

afterAll(() => {
    fs.writeFileSync(GROUPS_PATH, JSON.stringify(EXPECTED_GROUPS, null, '\t'))
})