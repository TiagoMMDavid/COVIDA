/* eslint-disable no-undef */
'use strict'

const GROUPS_PATH = './__tests__/mocks/groups-api.json'
const HOST = 'http://localhost:8000'

const frisby = require('frisby')
const path = require('path')
const fork = require('child_process').fork
const app = fork('./lib/covida-server.js', [path.join(process.cwd(), GROUPS_PATH)])
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
    },
    {
        name: 'ToBeReplaced',
        description: 'Group to replace in tests',
        games: []
    }
]

beforeAll(done => {
    app.on('message', msg => {
        if (msg.webRunning) {
            fs.writeFileSync(GROUPS_PATH, JSON.stringify(EXPECTED_GROUPS, null, '\t'))
            done()
        }
    })
})

it('should return JSON with links to other routes', () => frisby
    .get(`${HOST}/covida`)
    .expect('status', 200)
    .expect('json', 'topGames', `${HOST}/covida/games/top`)
    .expect('json', 'getGroups', `${HOST}/covida/groups`)
)

it('should search for a game', () => frisby
    .get(`${HOST}/covida/games/search?name=Fortnite`)
    .expect('status', 200)
    .expect('json', '[0].id', 1905)
    .expect('json', '[0].name', 'Fortnite')
)

it('should respond with 400 due to missing name in search', () => frisby
    .get(`${HOST}/covida/games/search`)
    .expect('status', 400)
)

it('should get the existing groups', () => frisby
    .get(`${HOST}/covida/groups/`)
    .expect('status', 200)
    .expect('json', '[0].name', EXPECTED_GROUPS[0].name)
    .expect('json', '[0].description', EXPECTED_GROUPS[0].description)
    .expect('json', '[1].name', EXPECTED_GROUPS[1].name)
    .expect('json', '[1].description', EXPECTED_GROUPS[1].description)
)

it('should get existing group', () => frisby
    .get(`${HOST}/covida/groups/Favorite`)
    .expect('status', 200)
    .expect('json', 'name', EXPECTED_GROUPS[0].name)
    .expect('json', 'description', EXPECTED_GROUPS[0].description)
    .expect('json', 'games[0].id', EXPECTED_GROUPS[0].games[0].id)
    .expect('json', 'games[0].name', EXPECTED_GROUPS[0].games[0].name)
)

it('should respond with 404 due to getting a non existing group', () => frisby
    .get(`${HOST}/covida/groups/None`)
    .expect('status', 404)
)


afterAll(() => {
    fs.writeFileSync(GROUPS_PATH, JSON.stringify(EXPECTED_GROUPS, null, '\t'))
    app.kill()
})