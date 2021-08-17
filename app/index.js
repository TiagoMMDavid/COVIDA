'use strict'

if (process.argv.length > 4) {
    console.log('Wrong usage! Use \'npm run [PORT] [ELASTICSEARCH_GROUP_INDEX]\'')
    return
}

let groupsIndex = process.argv[3]
let port = process.argv[2]
if (port != null && isNaN(port)) {
    console.log('Invalid Port! (Port can only be a number)')
    return
}

require('./lib/covida-server').init(groupsIndex, port)