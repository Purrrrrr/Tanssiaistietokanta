const validateInputType = require('../../hooks/validateGraphQLInputType');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validateInputType('WorkshopInput')],
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
