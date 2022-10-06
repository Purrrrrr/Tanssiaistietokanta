const L = require('partial.lenses');
const guid = require('../utils/guid');

/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const {
    events: eventsDb,
  } = params.context.models;

  const events = await eventsDb.findAsync();

  for (const event of events) {
    if (!event.program || event.program.length == 0) continue;

    const newEvent = L.modify(
      ['program', 'danceSets', L.elems, '_id'],
      guid,
      event,
    );

    await eventsDb.updateAsync({ _id: event._id}, newEvent);
  }

};

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {};
