// Initializes the `eventProgram` service on path `/event-program`
const { EventProgram } = require('./event-program.class')
const createModel = require('../../models/event-program.model')
const hooks = require('./event-program.hooks')
const {defaultChannels, withoutCurrentConnection} = require('../../utils/defaultChannels')
const {getDependenciesFor} = require('../../utils/dependencies')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/event-program', new EventProgram(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('event-program')

  service.publish((data, context) => {
    const eventIds = getDependenciesFor('event-program', data, 'usedBy', 'events')

    const channels = [
      ...eventIds.map(id => app.channel(`events/${id}/dances`))
    ]

    return [
      ...withoutCurrentConnection(channels, context),
      ...defaultChannels(app, context)
    ]
  })

  service.hooks(hooks)
}
