// Initializes the `channelConnections` service on path `/channel-connections`
const { ChannelConnections } = require('./channel-connections.class')
const hooks = require('./channel-connections.hooks')

module.exports = function (app) {
  // Initialize our service with any options it requires
  app.use('/channel-connections', new ChannelConnections(app))

  // Get our initialized service so that we can register hooks
  const service = app.service('channel-connections')

  service.hooks(hooks)
}
