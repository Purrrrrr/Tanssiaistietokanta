const validateInputType = require('../../hooks/validateGraphQLInputType')
const provideDefaultValues = require('../../hooks/provideDefaultValues')

const mergeEventPatch = require('../../hooks/merge-event-patch')
const processEventProgramInput = require('../../hooks/process-event-program-input')

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validateInputType('EventInput'), provideDefaultValues('EventInput', {program: null, workshops: []}), processEventProgramInput()],
    update: [validateInputType('EventInput'), processEventProgramInput()],
    patch: [validateInputType('PatchEventInput'), mergeEventPatch(), validateInputType('EventInput'), processEventProgramInput()],
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
