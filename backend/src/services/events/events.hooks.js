const validateInputType = require('../../hooks/validateGraphQLInputType')
const provideDefaultValues = require('../../hooks/provideDefaultValues')

const mergeEventPatch = require('../../hooks/merge-event-patch')
const { DEFAULT_PAUSE_BETWEEN_DANCES } = require('./constants')

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validateInputType('EventInput'), provideDefaultValues('EventInput', {program: { pauseBetweenDances: DEFAULT_PAUSE_BETWEEN_DANCES }, workshops: []})],
    update: [validateInputType('EventInput')],
    patch: [validateInputType('PatchEventInput'), mergeEventPatch(), validateInputType('EventInput')],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
