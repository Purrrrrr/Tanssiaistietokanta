// Initializes the `dances` service on path `/dances`
const createService = require('feathers-nedb');
const createModel = require('../../models/dances.model');
const hooks = require('./dances.hooks');

module.exports = function (app) {
  const Model = createModel(app);

  const options = { Model };

  // Initialize our service with any options it requires
  app.use('/dances', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('dances');

  service.hooks(hooks);
};
