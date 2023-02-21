// Initializes the `dances` service on path `/dances`
const createService = require('../../utils/versioningNedbService')
const createModel = require('../../models/dances.model')
const hooks = require('./dances.hooks')
const {defaultChannels, withoutCurrentConnection} = require('../../utils/defaultChannels')
const {getDependenciesFor} = require('../../utils/dependencies')

module.exports = function (app) {
  const Model = createModel(app)

  const options = { Model }

  // Initialize our service with any options it requires
  app.use('/dances', createService(options))

  // Get our initialized service so that we can register hooks
  const service = app.service('dances')

  service.publish((data, context) => {
    const eventIds = getDependenciesFor('dances', data, 'usedBy', 'events')
    const workshopIds = getDependenciesFor('dances', data, 'usedBy', 'workshops')

    const channels = [
      ...eventIds.map(id => app.channel(`events/${id}/dances`)),
      ...workshopIds.map(id => app.channel(`workshops/${id}/dances`))
    ]

    return [
      ...withoutCurrentConnection(channels, context),
      ...defaultChannels(app, context)
    ]
  })

  service.hooks(hooks)
}
