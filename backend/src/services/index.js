const dances = require('./dances/dances.service.js')
const events = require('./events/events.service.js')
const workshops = require('./workshops/workshops.service.js')
const convert = require('./convert/convert.service.js')
const channelConnections = require('./channel-connections/channel-connections.service.js')
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(dances)
  app.configure(events)
  app.configure(workshops)
  app.configure(convert)
  app.configure(channelConnections)
}
