/* eslint-disable no-undef */
'use strict'

const es = {
    host: 'localhost',
    port: '9200',
    groupsIndex: 'groups-services-tests'
}

const TOPGAMES_MOCK_PATH = './__tests__/mocks/topgames.json'
const SEARCHGAMES_FORTNITE_MOCK_PATH = './__tests__/mocks/searchgames-fortnite.json'
const SEARCHGAMES_EMPTY_MOCK_PATH = './__tests__/mocks/searchgames-empty.json'
const GET_GAME_BY_ID_PATH = './__tests__/mocks/getgamebyid-1.json'
const LISTGAMES_FAVORITE = './__tests__/mocks/listGames-Favorite.json'

const fetch = require('node-fetch')
const fs = require('fs')

require('./../lib/repo/covida-db').init(es.groupsIndex)
const service = require('./../lib/repo/covida-services')

const Response = jest.requireActual('node-fetch').Response
const actualFetch = jest.requireActual('node-fetch')

jest.mock('node-fetch')
fetch.mockImplementation((url, options) => actualFetch(url, options))

const expectedTopThreeGames = [
    'Grand Theft Auto V',
    'The Witcher 3: Wild Hunt',
    'The Elder Scrolls V: Skyrim'
]

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
        'name': 'Minecraft',
        'total_rating': 70.26100338264459
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

    return actualFetch(`http://${es.host}:${es.port}/${es.groupsIndex}/_doc/_bulk/?refresh`, options)
})

function mockFetchForIgdb(path) {
    fetch.mockImplementationOnce((url, options) => {
        let promise
        if (url.includes('https://api.igdb.com/v4/games')) {
            promise = Promise.resolve().then(() => new Response(fs.readFileSync(path)))
        } else {
            promise = actualFetch(url, options)
            mockFetchForIgdb(path)
        }
        return promise
    })
}

test('Test covida-services module getTopGames successfully', () => {
    mockFetchForIgdb(TOPGAMES_MOCK_PATH)

    return service.getTopGames(expectedTopThreeGames.length)
        .then(games => {
            expectedTopThreeGames.forEach((game, i) => {
                expect(game).toBeTruthy()
                expect(game).toBe(games[i].name)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module getTopGames with null limit', () => {
    mockFetchForIgdb(TOPGAMES_MOCK_PATH)

    return service.getTopGames(null)
        .then(games => {
            expectedTopThreeGames.forEach((game, i) => {
                expect(game).toBeTruthy()
                expect(game).toBe(games[i].name)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module searchGames successfully', () => {
    mockFetchForIgdb(SEARCHGAMES_FORTNITE_MOCK_PATH)

    return service.searchGames('Fortnite', 1)
        .then(games => {
            expect(games).toBeTruthy()
            expect(games[0].name).toBe('Fortnite')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module searchGames with null limit', () => {
    mockFetchForIgdb(SEARCHGAMES_FORTNITE_MOCK_PATH)

    return service.searchGames('Fortnite', null)
        .then(games => {
            expect(games).toBeTruthy()
            expect(games[0].name).toBe('Fortnite')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module searchGames empty', () => {
    mockFetchForIgdb(SEARCHGAMES_EMPTY_MOCK_PATH)

    return service.searchGames('nonexistent_game', 1)
        .then(games => {
            expect(games).toBeTruthy()
            expect(games.length == 0).toBeTruthy()
        })
        .catch(err => expect(err).toBeFalsy())
})


test('Test covida-services module getGameById successfully', () => {
    mockFetchForIgdb(GET_GAME_BY_ID_PATH)

    return service.getGameById(1)
        .then(game => {
            expect(game).toBeTruthy()
            expect(game.id).toBe(1)
            expect(game.name).toBe('Thief II: The Metal Age')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module getGameById null game', () => {
    return service.getGameById(null)
        .then(game => {
            expect(game).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module getGameById non existent game', () => {
    mockFetchForIgdb(SEARCHGAMES_EMPTY_MOCK_PATH)

    return service.getGameById(0)
        .then(game => {
            expect(game).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module getGroups successfully', () => {
    return service.getGroups()
        .then(groups => {
            expect(groups).toBeTruthy()
            groups.slice(0, 2).forEach((group, i) => {
                expect(group.id).toBe(EXPECTED_GROUPS[i].id)
                expect(group.name).toBe(EXPECTED_GROUPS[i].name)
                expect(group.description).toBe(EXPECTED_GROUPS[i].description)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})


test('Test covida-services module getGroup successfully', () => {
    return service.getGroup('1')
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

test('Test covida-services module getGroup for absent group id', () => {
    return service.getGroup('0')
        .then(group => {
            expect(group).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module addGroup successfully', () => {
    return service.addGroup('TestGroup', 'Test Description')
        .then(group => {
            expect(group).toBeTruthy()
            expect(group.name).toBe('TestGroup')
            expect(group.description).toBe('Test Description')
            expect(group.games.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module addGroup with an already existing group name', () => {
    return service.addGroup('ToBeReplaced', 'New description')
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
    return service.addGroup(null, 'N/A')
        .then(group => expect(group).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module editGroup successfully', () => {
    return service.editGroup('3', 'newName', 'newDesc')
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
    return service.editGroup('0', 'N/A', 'N/A')
        .then(group => expect(group).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test groups module deleteGroup successfully', () => {
    return service.deleteGroup('7')
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
    return service.deleteGroup('0')
        .then(group => expect(group).toBeFalsy())
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module addGameToGroup successfully', () => {
    mockFetchForIgdb(SEARCHGAMES_FORTNITE_MOCK_PATH)

    return service.addGameToGroup('5', 'Fortnite')
        .then(groupGame => {
            expect(groupGame).toBeTruthy()
            const group = groupGame.group
            const game = groupGame.game

            expect(group).toBeTruthy()
            expect(group.id).toBe('5')
            expect(group.name).toBe('ToBeAdded')
            expect(group.description).toBe('Group to add game in tests')

            expect(game).toBeTruthy()
            expect(game.id).toBe(1905)
            expect(game.name).toBe('Fortnite')
        })
        .catch(err => expect(err).toBeFalsy())
})


test('Test covida-services module addGameToGroup with non existent game', () => {
    mockFetchForIgdb(SEARCHGAMES_EMPTY_MOCK_PATH)

    return service.addGameToGroup('5', 'I Do Not Exist')
        .then(groupGame => {
            expect(groupGame).toBeTruthy()
            const group = groupGame.group
            const game = groupGame.game

            expect(group).toBeFalsy()
            expect(game).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module addGameToGroup for absent group id but existing game', () => {
    mockFetchForIgdb(SEARCHGAMES_FORTNITE_MOCK_PATH)

    return service.addGameToGroup('0', 'Fortnite') 
        .then(groupGame => {
            expect(groupGame).toBeTruthy()
            const group = groupGame.group
            const game = groupGame.game

            expect(group).toBeFalsy()
            expect(game).toBeTruthy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module addGameToGroup for duplicate game', () => {
    mockFetchForIgdb(SEARCHGAMES_FORTNITE_MOCK_PATH)

    return service.addGameToGroup('5', 'Fortnite')
        .then(groupGame => {
            expect(groupGame).toBeTruthy()
            const group = groupGame.group

            expect(group).toBeTruthy()
            expect(group.id).toBe('5')
            expect(group.name).toBe('ToBeAdded')
            expect(group.description).toBe('Group to add game in tests')
            const filteredGames = group.games.filter(game => game.id == 1905)

            expect(filteredGames.length).toBe(1)
            expect(filteredGames[0].id).toBe(1905)
            expect(filteredGames[0].name).toBe('Fortnite')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module deleteGameFromGroup successfully', () => {
    return service.deleteGameFromGroup('4', 1)
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

test('Test covida-services module deleteGameFromGroup for absent group id', () => {
    return service.deleteGameFromGroup('0', 9999)
        .then(groupGame => {
            expect(groupGame).toBeTruthy()
            expect(groupGame.group).toBeFalsy()
            expect(groupGame.game).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module deleteGameFromGroup for absent game', () => {
    return service.deleteGameFromGroup('1', 9999)
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

test('Test covida-services module listGroupGames successfully', () => {
    mockFetchForIgdb(LISTGAMES_FAVORITE)

    return service.listGroupGames('1', null, null)
        .then(groupGames => {
            expect(groupGames).toBeTruthy()

            const group = groupGames.group
            const games = groupGames.games

            expect(group).toBeTruthy()
            expect(group.id).toBe('1')
            expect(group.name).toBe('Favorite')
            
            expect(games).toBeTruthy()
            games.forEach((game, i) => {
                expect(game.id).toBe(SORTED_FAVORITE_GAMES[i].id)
                expect(game.name).toBe(SORTED_FAVORITE_GAMES[i].name)
                expect(game.total_rating).toBe(SORTED_FAVORITE_GAMES[i].total_rating)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})


test('Test covida-services module listGroupGames with min and max', () => {
    mockFetchForIgdb(LISTGAMES_FAVORITE)

    return service.listGroupGames('1', 73, 75)
        .then(groupGames => {
            expect(groupGames).toBeTruthy()

            const group = groupGames.group
            const games = groupGames.games

            expect(group).toBeTruthy()
            expect(group.id).toBe('1')
            expect(group.name).toBe('Favorite')
            
            expect(games).toBeTruthy()
            games.forEach((game, i) => {
                expect(game.id).toBe(17269)
                expect(game.name).toBe('ROBLOX')
                expect(game.total_rating).toBe(73.2117981273685)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module listGroupGames with non existent group', () => {
    return service.listGroupGames('0', 73, 75)
        .then(groupGames => {
            expect(groupGames).toBeTruthy()

            const group = groupGames.group
            const games = groupGames.games

            expect(group).toBeFalsy()
            expect(games).toBeFalsy()
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test covida-services module listGroupGames with minimum greater than maximum', () => {
    return service.listGroupGames('1', 75, 73)
        .then(groupGames => {
            expect(groupGames).toBeTruthy()

            const group = groupGames.group
            const games = groupGames.games

            expect(group).toBeTruthy()
            expect(games).toBeFalsy()
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

    return actualFetch(`http://${es.host}:${es.port}/${es.groupsIndex}/`, options)
})