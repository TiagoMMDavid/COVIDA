'use strict'

let groupsIndex
if(process.argv.length > 2) {
    groupsIndex = process.argv[2]
}

require('./lib/covida-server').init(groupsIndex)