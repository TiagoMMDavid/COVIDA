/* eslint-disable no-undef */
'use strict'

const GROUPS_PATH = './__tests__/mocks/groups-service.json'

const TOPGAMES_MOCK_PATH = './__tests__/mocks/topgames.json'
const SEARCHGAMES_FORTNITE_MOCK_PATH = './__tests__/mocks/searchgames-fortnite.json'
const SEARCHGAMES_EMPTY_MOCK_PATH = './__tests__/mocks/searchgames-empty.json'
const GET_GAME_BY_ID_PATH = './__tests__/mocks/getgamebyid-1.json'
const LISTGAMES_FAVORITE = './__tests__/mocks/listGames-Favorite.json'

require('./../lib/repo/covida-db').init(GROUPS_PATH)
const service = require('./../lib/repo/covida-services')
const fetch = require('node-fetch')
//DELETE BELOW

const fs = require('fs')

jest.mock('node-fetch')

const expectedTopThreeGames = [
    'Grand Theft Auto V',
    'The Witcher 3: Wild Hunt',
    'The Elder Scrolls V: Skyrim'
]

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
    },
    {
        name: 'ToBeReplaced',
        description: 'Group to replace in tests',
        games: []
    }
]

const SORTED_FAVORITE_GAMES = [
    {
        'id': 1905,
        'follows': 280,
        'name': 'Fortnite',
        'total_rating': 75.50220465952715
    },
    {
        'id': 17269,
        'follows': 45,
        'name': 'ROBLOX',
        'total_rating': 73.2117981273685
    },
    {
        'id': 135400,
        'follows': 8,
        'name': 'Minecraft'
    }
]

beforeAll(() => {
    fs.writeFileSync(GROUPS_PATH, JSON.stringify(EXPECTED_GROUPS, null, '\t'))
})

function getPromiseForFetchMock(path) {
    return Promise.resolve().then(() => {
        const toReturn = {
            json: function() {
                return JSON.parse(fs.readFileSync(path))
            }
        }
        return toReturn
    })
}

test('Test covida-services module getTopGames successfully', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(TOPGAMES_MOCK_PATH))

    service.getTopGames(expectedTopThreeGames.length)
        .then(games => {
            expectedTopThreeGames.forEach((game, i) => {
                expect(game).toBe(games[i].name)
            })
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test covida-services module getTopGames with null limit', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(TOPGAMES_MOCK_PATH))

    service.getTopGames(null)
        .then(games => {
            expectedTopThreeGames.forEach((game, i) => {
                expect(game).toBe(games[i].name)
            })
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test covida-services module searchGames successfully', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(SEARCHGAMES_FORTNITE_MOCK_PATH))

    service.searchGames('Fortnite', 1)
        .then(games => {
            expect(games[0].name).toBe('Fortnite')
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test covida-services module searchGames with null limit', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(SEARCHGAMES_FORTNITE_MOCK_PATH))

    service.searchGames('Fortnite', null)
        .then(games => {
            expect(games[0].name).toBe('Fortnite')
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test covida-services module searchGames empty', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(SEARCHGAMES_EMPTY_MOCK_PATH))

    service.searchGames('nonexistent_game', 1)
        .then(games => {
            expect(games.length == 0).toBeTruthy()
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})


test('Test covida-services module getGameById successfully', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(GET_GAME_BY_ID_PATH))

    service.getGameById(1)
        .then(game => {
            expect(game.id).toBe(1)
            expect(game.name).toBe('Thief II: The Metal Age')
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})


test('Test covida-services module getGameById null game', done => {
    service.getGameById(null)
        .then(game => {
            expect(game).toBeFalsy()
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test covida-services module getGameById non existent game', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(SEARCHGAMES_EMPTY_MOCK_PATH))

    service.getGameById(0)
        .then(game => {
            expect(game).toBeFalsy()
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test covida-services module getGroups successfully', done => {
    service.getGroups((err, groups) => {
        expect(err).toBeFalsy()

        expect(groups).toBeTruthy()
        groups.slice(0, 2).forEach((group, i) => {
            expect(group.name).toBe(EXPECTED_GROUPS[i].name)
            expect(group.description).toBe(EXPECTED_GROUPS[i].description)
        })

        done()
    })
})

test('Test covida-services module getGroup successfully', done => {
    service.getGroup('Favorite', (err, group) => {
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

test('Test covida-services module getGroup for absent group name', done => {
    service.getGroup('Absent', (err, group) => {
        expect(err).toBeFalsy()
        expect(group).toBeFalsy()
        done()
    })
})

test('Test covida-services module addGroup successfully', done => {
    service.addGroup('TestGroup', 'Test Description', (err, group) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('TestGroup')
        expect(group.description).toBe('Test Description')
        expect(group.games.length).toBe(0)
        done()
    })
})

test('Test covida-services module addGroup with an existing group', done => {
    service.addGroup('ToBeReplaced', 'New description', (err, group) => {
        expect(err).toBeFalsy()
        expect(group.name).toBe('ToBeReplaced')
        expect(group.description).toBe('New description')
        expect(group.games.length).toBe(0)
        done()
    })
})

test('Test covida-services module addGroup with null name', done => {
    service.addGroup(null, 'N/A', (err, group) => {
        expect(err).toBeFalsy()
        expect(group).toBeFalsy()
        done()
    })
})

test('Test covida-services module editGroup successfully', done => {
    service.editGroup('ToBeEdited', 'newName', 'newDesc', (err, group) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('newName')
        expect(group.description).toBe('newDesc')
        expect(group.games.length).toBe(0)
        done()
    })
})

test('Test covida-services module editGroup for absent group name', done => {
    service.editGroup('Absent', 'N/A', 'N/A', (err, group) => {
        expect(err).toBeFalsy()
        expect(group).toBeFalsy()
        done()
    })
})

test('Test covida-services module editGroup for duplicate group name', done => {
    service.editGroup('Favorite', 'eSports', 'N/A', (err, group) => {
        expect(err).toBeFalsy()
        expect(group).toBeTruthy()
        expect(group.name).toBeFalsy()
        done()
    })
})

test('Test covida-services module addGameToGroup successfully', done => {
    urllib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(SEARCHGAMES_FORTNITE_MOCK_PATH, cb)
    })

    service.addGameToGroup('ToBeAdded', 'Fortnite', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('ToBeAdded')
        expect(group.description).toBe('Group to add game in tests')

        expect(game).toBeTruthy()
        expect(game.id).toBe(1905)
        expect(game.name).toBe('Fortnite')
        done()
    })
})

test('Test covida-services module addGameToGroup with non existant game', done => {
    urllib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(SEARCHGAMES_EMPTY_MOCK_PATH, cb)
    })

    service.addGameToGroup('ToBeAdded', 'I Do Not Exist', (err, group, game) => {
        expect(err).toBeFalsy()
        expect(group).toBeFalsy()
        expect(game).toBeFalsy()
        done()
    })
})

test('Test covida-services module addGameToGroup for absent group name but existing game', done => {
    urllib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(SEARCHGAMES_FORTNITE_MOCK_PATH, cb)
    })

    service.addGameToGroup('Absent', 'Fortnite', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeFalsy()
        expect(game).toBeTruthy()
        done()
    })
})

test('Test covida-services module addGameToGroup for duplicate game', done => {
    urllib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(SEARCHGAMES_FORTNITE_MOCK_PATH, cb)
    })

    service.addGameToGroup('Favorite', 'Fortnite', (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        expect(game).toBeTruthy()
        const filteredGames = group.games.filter(game => game.id == 1905)
        expect(filteredGames.length).toBe(1)
        expect(filteredGames[0].id).toBe(1905)
        expect(filteredGames[0].name).toBe('Fortnite')
        done()
    })
})

test('Test covida-services module deleteGameFromGroup successfully', done => {
    service.deleteGameFromGroup('ToBeRemoved', 1, (err, group, game) => {
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

test('Test covida-services module deleteGameFromGroup for absent group name', done => {
    service.deleteGameFromGroup('Absent', 9999, (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeFalsy()
        expect(game).toBeFalsy()
        done()
    })
})

test('Test covida-services module deleteGame for absent game', done => {
    service.deleteGameFromGroup('Favorite', 9999, (err, group, game) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        expect(game).toBeFalsy()
        done()
    })
})

test('Test covida-services module listGroupGames successfully', done => {
    urllib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(LISTGAMES_FAVORITE, cb)
    })

    service.listGroupGames('Favorite', null, null, (err, group, games) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        
        expect(games).toBeTruthy()
        games.forEach((game, i) => {
            expect(game.id).toBe(SORTED_FAVORITE_GAMES[i].id)
            expect(game.name).toBe(SORTED_FAVORITE_GAMES[i].name)
            expect(game.total_rating).toBe(SORTED_FAVORITE_GAMES[i].total_rating)
        })

        done()
    })
})

test('Test covida-services module listGroupGames with min and max', done => {
    urllib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(LISTGAMES_FAVORITE, cb)
    })

    service.listGroupGames('Favorite', 73, 75, (err, group, games) => {
        expect(err).toBeFalsy()

        expect(group).toBeTruthy()
        expect(group.name).toBe('Favorite')
        
        expect(games).toBeTruthy()
        games.forEach((game, i) => {
            expect(game.id).toBe(17269)
            expect(game.name).toBe('ROBLOX')
            expect(game.total_rating).toBe(73.2117981273685)
        })

        done()
    })
})

test('Test covida-services module listGroupGames with non existant group', done => {
    service.listGroupGames('I don\'t exist', 73, 75, (err, group, games) => {
        expect(err).toBeFalsy()
        expect(group).toBeFalsy()
        expect(games).toBeFalsy()
        done()
    })
})

test('Test covida-services module listGroupGames with minimum greated than maximum', done => {
    service.listGroupGames('Favorite', 75, 73, (err, group, games) => {
        expect(err).toBeFalsy()
        expect(group).toBeTruthy()
        expect(games).toBeFalsy()
        done()
    })
})

afterAll(() => {
    fs.writeFileSync(GROUPS_PATH, JSON.stringify(EXPECTED_GROUPS, null, '\t'))
})