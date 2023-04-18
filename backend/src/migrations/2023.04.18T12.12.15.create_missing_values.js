const updateDatabase = require('../utils/updateDatabase')
const L = require('partial.lenses')
const R = require('ramda')

/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const eventsDb = params.context.getModel('events')

  const whenUndefined = L.when(R.equals(undefined))

  await updateDatabase(eventsDb, R.compose(
    L.modify(
      ['program', 'danceSets', L.elems],
      danceSet => ({
        titleSlideStyleId: null,
        ...danceSet,
        program: L.set(
          [L.elems, 'slideStyleId', whenUndefined],
          null,
          danceSet.program,
        )
      })
    ),
    L.set(
      ['program', 'introductions', 'titleSlideStyleId', whenUndefined],
      null,
    ),
    L.set(
      ['program', 'introductions', 'title', whenUndefined],
      null,
    ),
    L.set(
      ['program', 'slideStyleId', whenUndefined],
      null,
    ),
  ))
}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
