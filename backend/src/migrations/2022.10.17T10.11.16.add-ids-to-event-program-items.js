const L = require('partial.lenses')
const R = require('ramda')
const guid = require('../utils/guid')

/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const {
    events: eventsDb
  } = params.context.models

  const events = await eventsDb.findAsync()

  for (const event of events) {
    if (!event.program || event.program.length == 0) continue
    
    const newEvent = R.evolve({
      program: {
        introductions: L.modify([L.elems, '_id'], guid),
        danceSets: L.modify(
          [L.elems, 'program', L.elems, '_id'], guid
        )
      }
    }, event)

    await eventsDb.updateAsync({ _id: event._id}, newEvent)
  }

}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
