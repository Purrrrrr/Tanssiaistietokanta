const validateInputType = require('../../hooks/validateGraphQLInputType')
const provideDefaultValues = require('../../hooks/provideDefaultValues')
const preventPatchOps = require('../../hooks/prevent-patch-ops')

const loadEventProgram = require('../../hooks/load-event-program')

const processEventProgramInput = require('../../hooks/process-event-program-input')

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validateInputType('EventInput'), provideDefaultValues('EventInput', {program: null, workshops: []}), processEventProgramInput()],
    update: [validateInputType('EventInput'), processEventProgramInput()],
    patch: [preventPatchOps({keys: 'program'}), processEventProgramInput()],
    remove: []
  },

  after: {
    all: [loadEventProgram()],
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
