// Application hooks that run for every service
const log = require('./hooks/log')
const preventRemovingOfUsedItems = require('./hooks/prevent-removing-of-used-items')

module.exports = {
  before: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [preventRemovingOfUsedItems()]
  },

  after: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
