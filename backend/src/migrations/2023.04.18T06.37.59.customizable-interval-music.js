const updateDatabase = require('../utils/updateDatabase')
const L = require('partial.lenses')
const R = require('ramda')

/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const eventsDb = params.context.getModel('events')

  await updateDatabase(eventsDb, R.compose(
    L.modify(
      ['program', 'danceSets', L.elems],
      ({intervalMusicDuration, intervalMusicSlideStyleId, ...rest}) => ({
        ...rest,
        intervalMusic: intervalMusicDuration ? {
          name: null,
          description: null,
          duration: intervalMusicDuration,
          slideStyleId: intervalMusicSlideStyleId,
        } : null,
      })
    ),
    L.set(
      ['program', 'defaultIntervalMusic'],
      {
        name: null,
        description: null,
        duration: 15*60,
        slideStyleId: null,
      }
    )
  ))
}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
