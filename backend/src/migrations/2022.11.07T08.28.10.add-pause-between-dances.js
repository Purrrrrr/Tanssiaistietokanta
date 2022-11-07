const updateDatabase = require('../utils/updateDatabase')
const L = require('partial.lenses')
const { DEFAULT_PAUSE_BETWEEN_DANCES } = require('../services/events/constants')

/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const eventsDb = params.context.getModel('events')
  await updateDatabase(eventsDb, L.set(['program', 'pauseBetweenDances'], DEFAULT_PAUSE_BETWEEN_DANCES))
}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
