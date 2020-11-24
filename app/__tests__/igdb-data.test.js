/* eslint-disable no-undef */
'use strict'

const TOPGAMES_MOCK_PATH = './__tests__/mocks/topgames.json'
const SEARCHGAMES_FORTNITE_MOCK_PATH = './__tests__/mocks/searchgames-fortnite.json'
const SEARCHGAMES_EMPTY_MOCK_PATH = './__tests__/mocks/searchgames-empty.json'

const igdb = require('./../lib/repo/igdb-data')
const urlib = require('urllib')
const fs = require('fs')

jest.mock('urllib')

const expectedTopThreeGames = [
    'Grand Theft Auto V',
    'The Witcher 3: Wild Hunt',
    'The Elder Scrolls V: Skyrim'
]

test('Test igdb-data module getTopGames successfully', done => {
    urlib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(TOPGAMES_MOCK_PATH, cb)
    })

    igdb.getTopGames(expectedTopThreeGames.length, (err, games) => {
        expect(err).toBeFalsy()
        expectedTopThreeGames.forEach((game, i) => {
            expect(game).toBe(games[i].name)
        })
        done()
    })
})

test('Test igdb-data module searchGames successfully', done => {
    urlib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(SEARCHGAMES_FORTNITE_MOCK_PATH, cb)
    })

    igdb.searchGames('Fortnite', 1, (err, games) => {
        expect(err).toBeFalsy()
        expect(games[0].name).toBe('Fortnite')
        done()
    })
})

test('Test igdb-data module searchGames empty', done => {
    urlib.request.mockImplementationOnce((url, options, cb) => {
        fs.readFile(SEARCHGAMES_EMPTY_MOCK_PATH, cb)
    })

    igdb.searchGames('nonexistent_game', 1, (err, games) => {
        expect(err).toBeFalsy()
        expect(games.length == 0).toBeTruthy()
        done()
    })
})