const validateInputType = require('../../hooks/validateGraphQLInputType');
const provideDefaultValues = require('../../hooks/provideDefaultValues');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validateInputType('WorkshopInput'), provideDefaultValues('WorkshopInput')],
    update: [validateInputType('WorkshopInput')],
    patch: [],
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
