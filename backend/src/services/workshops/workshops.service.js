// Initializes the `workshops` service on path `/workshops`
const createService = require('feathers-nedb');
const R = require('ramda');
const createModel = require('../../models/workshops.model');
const hooks = require('./workshops.hooks');
const {defaultChannels, withoutCurrentConnection} = require('../../utils/defaultChannels');
const {getDependenciesFor} = require('../../utils/dependencies');
const getFromData = require('../../utils/getFromData');

module.exports = function (app) {
  const Model = createModel(app);

  const options = {
    Model,
  };

  // Initialize our service with any options it requires
  app.use('/workshops', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('workshops');

  service.publish((data,context) => {
    const eventIds = getFromData(data, item => item.eventId);
    //The dependency graph is not updated yet. We can get our previous dances from there in case some were removed
    const previousDanceIds = getDependenciesFor('workshops', data, 'uses', 'dances');
    const nextDanceIds = getFromData(data, item => item.danceIds).flat();
    const danceIds = R.uniq([...nextDanceIds, ...previousDanceIds]);

    const channels = [
      ...eventIds.map(id => app.channel(`events/${id}/workshops`)),
      ...danceIds.map(id => app.channel(`dances/${id}/workshops`))
    ];

    return [
      ...withoutCurrentConnection(channels, context),
      ...defaultChannels(data, context)
    ];
  });

  service.hooks(hooks);
};
