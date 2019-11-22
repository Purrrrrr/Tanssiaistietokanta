// Initializes the `workshops` service on path `/workshops`
const createService = require('feathers-nedb');
const createModel = require('../../models/workshops.model');
const hooks = require('./workshops.hooks');

module.exports = function (app) {
  const Model = createModel(app);

  const options = {
    Model,
  };

  // Initialize our service with any options it requires
  app.use('/workshops', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('workshops');

  service.hooks(hooks);
};
