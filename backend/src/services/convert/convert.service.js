// Initializes the `convert` service on path `/convert`
const { Convert } = require('./convert.class');
const hooks = require('./convert.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/convert', new Convert(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('convert');

  service.hooks(hooks);
};
