const validateInputType = require('../../hooks/validateGraphQLInputType');
const provideDefaultValues = require('../../hooks/provideDefaultValues');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validateInputType('DanceInput'), provideDefaultValues('DanceInput')],
    update: [validateInputType('DanceInput')],
    patch: [validateInputType('DancePatchInput')],
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
};
