/* eslint-disable no-undef */
'use strict'

const GROUPS_PATH = './__tests__/mocks/groups-api.json'
const HOST = 'http://localhost:8000'

const frisby = require('frisby')
const Joi = frisby.Joi
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

/**
 * GET ${HOST}/covida
 */
it('should return JSON with links to other routes', () => frisby
    .get(`${HOST}/covida`)
    .expect('status', 200)
    .expect('json', 'topGames', `${HOST}/covida/games/top`)
    .expect('json', 'getGroups', `${HOST}/covida/groups`)
)

/**
 * GET ${HOST}/covida/games/top
 */
it('should return JSON with top games', () => frisby
    .get(`${HOST}/covida/games/top`)
    .expect('status', 200)
    .expect('jsonTypes', '*', {
        'id': Joi.number().min(1).required(),
        'follows': Joi.number().min(0).required(),
        'name': Joi.string().required(),
        'summary': Joi.string().required(),
        'total_rating': Joi.number().min(0)
    })
)

it('should respond with 400 due to invalid limit in top games', () => frisby
    .get(`${HOST}/covida/games/top?limit=1000`)
    .expect('status', 400)
)

/**
 * GET ${HOST}/covida/games/search
 */
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

/**
 * GET ${HOST}/covida/games/<id>
 */
it('should get a game by id', () => frisby
    .get(`${HOST}/covida/games/1`)
    .expect('status', 200)
    .expect('jsonTypes', '', { 
        'id': 1,
        'follows': Joi.number().min(0).required(),
        'name': 'Thief II: The Metal Age',
        'summary': Joi.string().required(),
        'total_rating': Joi.number().min(0)
    })
)

it('should respond with 404 due to no game with specified id', () => frisby
    .get(`${HOST}/covida/games/0`)
    .expect('status', 404)
)

/**
 * GET ${HOST}/covida/groups
 */
it('should get the existing groups', () => frisby
    .get(`${HOST}/covida/groups/`)
    .expect('status', 200)
    .expect('json', '[0].name', EXPECTED_GROUPS[0].name)
    .expect('json', '[0].description', EXPECTED_GROUPS[0].description)
    .expect('json', '[1].name', EXPECTED_GROUPS[1].name)
    .expect('json', '[1].description', EXPECTED_GROUPS[1].description)
)

/**
 * GET ${HOST}/covida/groups/name
 */
it('should get existing group', () => frisby
    .get(`${HOST}/covida/groups/Favorite`)
    .expect('status', 200)
    .expect('json', 'name', EXPECTED_GROUPS[0].name)
    .expect('json', 'description', EXPECTED_GROUPS[0].description)
    .expect('json', 'games[0].id', EXPECTED_GROUPS[0].games[0].id)
    .expect('json', 'games[0].name', EXPECTED_GROUPS[0].games[0].name)
)

it('should respond with 404 due to getting a non existing group in /groups/<group>', () => frisby
    .get(`${HOST}/covida/groups/None`)
    .expect('status', 404)
)

/**
 * GET ${HOST}/covida/groups/<name>/games
 */
it('should get existing group games', () => frisby
    .get(`${HOST}/covida/groups/Favorite/games`)
    .expect('status', 200)
    .expect('jsonTypes', '*', { 
        'id': Joi.number().min(1).required(),
        'follows': Joi.number().min(0).required(),
        'name': Joi.string().required(),
        'summary': Joi.string().required(),
        'total_rating': Joi.number().min(0)
    })
)

it('should respond with 404 due to non existing group in /<group>/games', () => frisby 
    .get(`${HOST}/covida/groups/None/games`)
    .expect('status', 404)
)

it('should respond with 400 due to invalid min and max in /<group>/games', () => frisby 
    .get(`${HOST}/covida/groups/Favorite/games?min=50&max=40`)
    .expect('status', 400)
)

/**
 * PUT ${HOST}/covida/groups
 */
it('should add group', () => frisby
    .fetch(`${HOST}/covida/groups`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=newGroup&description=newDescription'
    })
    .expect('status', 201)
)

it('should respond with 400 due to no group name specified in add group', () => frisby
    .put(`${HOST}/covida/groups`)
    .expect('status', 400)
)

/**
 * PUT ${HOST}/covida/groups/<name>
 */
it('should edit group', () => frisby
    .fetch(`${HOST}/covida/groups/ToBeEdited`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=newName&description=newDescription'
    })
    .expect('status', 200)
)

it('should respond with 400 due to no new group name and description specified in edit group', () => frisby
    .put(`${HOST}/covida/groups/Favorite`)
    .expect('status', 400)
)

it('should respond with 404 due to non existing group in edit group', () => frisby
    .fetch(`${HOST}/covida/groups/None`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=newGroup&description=newDescription'
    })
    .expect('status', 404)
)

it('should respond with 409 due to editing to an already existing group name', () => frisby
    .fetch(`${HOST}/covida/groups/Favorite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=eSports&description=newDescription'
    })
    .expect('status', 409)
)

/**
 * PUT ${HOST}/covida/groups/<name>/games
 */
it('should add game to group', () => frisby
    .fetch(`${HOST}/covida/groups/ToBeAdded/games`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=Fortnite'
    })
    .expect('status', 201)
)

it('should respond with 400 due to no game specified in add game to group', () => frisby
    .put(`${HOST}/covida/groups/ToBeAdded/games`)
    .expect('status', 400)
)

it('should respond with 404 due to non existing game in add game to group', () => frisby
    .fetch(`${HOST}/covida/groups/ToBeAdded/games`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=idontexist12345'
    })
    .expect('status', 404)
)

it('should respond with 404 due to non existing group in add game to group', () => frisby
    .fetch(`${HOST}/covida/groups/None/games`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=Fortnite'
    })
    .expect('status', 404)
)

/**
 * DELETE ${HOST}/covida/groups/<name>/games/<id>
 */
it('should delete game from group', () => frisby 
    .del(`${HOST}/covida/groups/ToBeRemoved/games/1`)
    .expect('status', 200)
)

it('should respond with 404 due to non existing group in DELETE game', () => frisby 
    .del(`${HOST}/covida/groups/None/games/`)
    .expect('status', 404)
)

it('should respond with 404 due to non existing game in DELETE game', () => frisby 
    .del(`${HOST}/covida/groups/ToBeRemoved/games/100`)
    .expect('status', 404)
)

afterAll(() => {
    fs.writeFileSync(GROUPS_PATH, JSON.stringify(EXPECTED_GROUPS, null, '\t'))
    app.kill()
})