const dances = require('./dances/dances.service.js');
const events = require('./events/events.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(dances);
  app.configure(events);
};
