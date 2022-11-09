const updateDatabase = require('../utils/updateDatabase')
const L = require('partial.lenses')

/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const eventsDb = params.context.getModel('events')

  await updateDatabase(eventsDb, L.modify(
    ['program', 'danceSets', L.elems],
    ({name, ...rest}) => ({title: name, ...rest})
  ))

}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
