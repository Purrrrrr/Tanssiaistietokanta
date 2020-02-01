const validateInputType = require('../../hooks/validateGraphQLInputType');
const preventPatchOps = require('../../hooks/prevent-patch-ops');

const loadEventProgram = require('../../hooks/load-event-program');

const processEventProgramInput = require('../../hooks/process-event-program-input');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validateInputType('EventInput'), processEventProgramInput()],
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
};
