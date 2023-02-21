// Initializes the `events` service on path `/events`
const createService = require('../../utils/versioningNedbService')
const createModel = require('../../models/events.model')
const hooks = require('./events.hooks')

module.exports = function (app) {
  const Model = createModel(app)

  const options = {
    Model
  }

  // Initialize our service with any options it requires
  app.use('/events', createService(options))

  // Get our initialized service so that we can register hooks
  const service = app.service('events')

  service.hooks(hooks)
}
