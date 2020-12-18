/* eslint-disable no-undef */
'use strict'

const TOPGAMES_MOCK_PATH = './__tests__/mocks/topgames.json'
const SEARCHGAMES_FORTNITE_MOCK_PATH = './__tests__/mocks/searchgames-fortnite.json'
const SEARCHGAMES_EMPTY_MOCK_PATH = './__tests__/mocks/searchgames-empty.json'
const GET_GAME_BY_ID_PATH = './__tests__/mocks/getgamebyid-1-and-2.json'


const fetch = require('node-fetch')
const fs = require('fs')

const igdb = require('./../lib/repo/igdb-data')

const Response = jest.requireActual('node-fetch').Response
jest.mock('node-fetch')

const expectedTopThreeGames = [
    'Grand Theft Auto V',
    'The Witcher 3: Wild Hunt',
    'The Elder Scrolls V: Skyrim'
]

function getPromiseForFetchMock(path) {
    return Promise.resolve().then(() => new Response(fs.readFileSync(path)))
}

test('Test igdb-data module getTopGames successfully', () => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(TOPGAMES_MOCK_PATH))

    return igdb.getTopGames(expectedTopThreeGames.length)
        .then(games => {
            expect(games).toBeTruthy()
            expectedTopThreeGames.forEach((game, i) => {
                expect(game).toBe(games[i].name)
            })
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test igdb-data module searchGames successfully', () => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(SEARCHGAMES_FORTNITE_MOCK_PATH))

    return igdb.searchGames('Fortnite', 1)
        .then(games => {
            expect(games).toBeTruthy()
            expect(games[0].name).toBe('Fortnite')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test igdb-data module searchGames empty', () => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(SEARCHGAMES_EMPTY_MOCK_PATH))

    return igdb.searchGames('nonexistent_game', 1)
        .then(games => {
            expect(games).toBeTruthy()
            expect(games.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test igdb-data module getGamesByIds successfully', () => {
    fetch.mockImplementationOnce((url, options) => getPromiseForFetchMock(GET_GAME_BY_ID_PATH))

    return igdb.getGamesByIds([1, 2])
        .then(games => {
            expect(games).toBeTruthy()
            expect(games.length).toBe(2)

            expect(games[0].id).toBe(1)
            expect(games[0].name).toBe('Thief II: The Metal Age')
            expect(games[1].id).toBe(2)
            expect(games[1].name).toBe('Thief: The Dark Project')
        })
        .catch(err => expect(err).toBeFalsy())
})

test('Test igdb-data module getGamesByIds empty', () => {
    return igdb.getGamesByIds([])
        .then(games => {
            expect(games).toBeTruthy()
            expect(games.length).toBe(0)
        })
        .catch(err => expect(err).toBeFalsy())
})