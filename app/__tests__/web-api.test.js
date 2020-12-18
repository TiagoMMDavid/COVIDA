/* eslint-disable no-undef */
'use strict'

const es = {
    host: 'localhost',
    port: '9200',
    groupsIndex: 'groups-api-tests'
}

const HOST = 'http://localhost:8000'

const fetch = require('node-fetch')
const frisby = require('frisby')
const Joi = frisby.Joi

const server = require('../lib/covida-server.js')

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

beforeAll(done => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: getBulkBodyString()
    }

    fetch(`http://${es.host}:${es.port}/${es.groupsIndex}/_doc/_bulk/?refresh`, options)
        .then(() => {
            server.init(es.groupsIndex, done)
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

it('should respond with 400 due to invalid limit in search', () => frisby
    .get(`${HOST}/covida/games/search?limit=1000`)
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
    .expect('json', '[0].id', EXPECTED_GROUPS[0].id)
    .expect('json', '[0].name', EXPECTED_GROUPS[0].name)
    .expect('json', '[0].description', EXPECTED_GROUPS[0].description)
    .expect('json', '[1].id', EXPECTED_GROUPS[1].id)
    .expect('json', '[1].name', EXPECTED_GROUPS[1].name)
    .expect('json', '[1].description', EXPECTED_GROUPS[1].description)
)

/**
 * GET ${HOST}/covida/groups/id
 */
it('should get existing group', () => frisby
    .get(`${HOST}/covida/groups/1`)
    .expect('status', 200)
    .expect('json', 'id', EXPECTED_GROUPS[0].id)
    .expect('json', 'name', EXPECTED_GROUPS[0].name)
    .expect('json', 'description', EXPECTED_GROUPS[0].description)
    .expect('json', 'games[0].id', EXPECTED_GROUPS[0].games[0].id)
    .expect('json', 'games[0].name', EXPECTED_GROUPS[0].games[0].name)
)

it('should respond with 404 due to getting a non existing group in /groups/<group>', () => frisby
    .get(`${HOST}/covida/groups/0`)
    .expect('status', 404)
)

/**
 * GET ${HOST}/covida/groups/<id>/games
 */
it('should get existing group games', () => frisby
    .get(`${HOST}/covida/groups/1/games`)
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
    .get(`${HOST}/covida/groups/0/games`)
    .expect('status', 404)
)

it('should respond with 400 due to invalid min and max in /<group>/games', () => frisby 
    .get(`${HOST}/covida/groups/1/games?min=50&max=40`)
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
 * PUT ${HOST}/covida/groups/<id>
 */
it('should edit group', () => frisby
    .fetch(`${HOST}/covida/groups/3`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=newName&description=newDescription'
    })
    .expect('status', 200)
)

it('should respond with 400 due to no new group name and description specified in edit group', () => frisby
    .put(`${HOST}/covida/groups/1`)
    .expect('status', 400)
)

it('should respond with 404 due to non existing group in edit group', () => frisby
    .fetch(`${HOST}/covida/groups/0`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=newGroup&description=newDescription'
    })
    .expect('status', 404)
)

it('should change group name to an already existing group name', () => frisby
    .fetch(`${HOST}/covida/groups/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=eSports&description=newDescription'
    })
    .expect('status', 200)
)

/**
 * PUT ${HOST}/covida/groups/<id>/games
 */
it('should add game to group', () => frisby
    .fetch(`${HOST}/covida/groups/5/games`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=Fortnite'
    })
    .expect('status', 201)
)

it('should respond with 400 due to no game specified in add game to group', () => frisby
    .put(`${HOST}/covida/groups/5/games`)
    .expect('status', 400)
)

it('should respond with 404 due to non existing game in add game to group', () => frisby
    .fetch(`${HOST}/covida/groups/5/games`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=idontexist12345'
    })
    .expect('status', 404)
)

it('should respond with 404 due to non existing group in add game to group', () => frisby
    .fetch(`${HOST}/covida/groups/0/games`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'name=Fortnite'
    })
    .expect('status', 404)
)

/**
 * DELETE ${HOST}/covida/groups/<id>/games/<id>
 */
it('should delete game from group', () => frisby 
    .del(`${HOST}/covida/groups/4/games/1`)
    .expect('status', 200)
)

it('should respond with 404 due to non existing group in DELETE game', () => frisby 
    .del(`${HOST}/covida/groups/0/games/`)
    .expect('status', 404)
)

it('should respond with 404 due to non existing game in DELETE game', () => frisby 
    .del(`${HOST}/covida/groups/4/games/100`)
    .expect('status', 404)
)

/**
 * DELETE ${HOST}/covida/groups/<group>
 */
it('should delete group', () => frisby 
    .del(`${HOST}/covida/groups/7`)
    .expect('status', 200)
)

it('should respond with 404 due to non existing group in DELETE group', () => frisby 
    .del(`${HOST}/covida/groups/0`)
    .expect('status', 404)
)

afterAll(() => {
    server.close()
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }

    return fetch(`http://${es.host}:${es.port}/${es.groupsIndex}/`, options)
})