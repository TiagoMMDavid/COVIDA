/* eslint-disable no-undef */
'use strict'

const TOPGAMES_MOCK_PATH = './__tests__/mocks/topgames.json'
const SEARCHGAMES_FORTNITE_MOCK_PATH = './__tests__/mocks/searchgames-fortnite.json'
const SEARCHGAMES_EMPTY_MOCK_PATH = './__tests__/mocks/searchgames-empty.json'
const GET_GAME_BY_ID_PATH = './__tests__/mocks/getgamebyid-1-and-2.json'

const igdb = require('./../lib/repo/igdb-data')
const fetch = require('node-fetch')
const fs = require('fs')

jest.mock('node-fetch')

const expectedTopThreeGames = [
    'Grand Theft Auto V',
    'The Witcher 3: Wild Hunt',
    'The Elder Scrolls V: Skyrim'
]

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

test('Test igdb-data module getTopGames successfully', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(TOPGAMES_MOCK_PATH))

    igdb.getTopGames(expectedTopThreeGames.length)
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

test('Test igdb-data module searchGames successfully', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(SEARCHGAMES_FORTNITE_MOCK_PATH))

    igdb.searchGames('Fortnite', 1)
        .then(games => {
            expect(games[0].name).toBe('Fortnite')
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test igdb-data module searchGames empty', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(SEARCHGAMES_EMPTY_MOCK_PATH))

    igdb.searchGames('nonexistent_game', 1)
        .then(games => {
            expect(games.length == 0).toBeTruthy()
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test igdb-data module getGamesByIds successfully', done => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(GET_GAME_BY_ID_PATH))

    igdb.getGamesByIds([1, 2])
        .then(games => {
            expect(games[0].id).toBe(1)
            expect(games[0].name).toBe('Thief II: The Metal Age')
            expect(games[1].id).toBe(2)
            expect(games[1].name).toBe('Thief: The Dark Project')

            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})

test('Test igdb-data module getGamesByIds empty', done => {
    igdb.getGamesByIds([])
        .then(games => {
            expect(games).toBeTruthy()
            expect(games.length).toBe(0)
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})