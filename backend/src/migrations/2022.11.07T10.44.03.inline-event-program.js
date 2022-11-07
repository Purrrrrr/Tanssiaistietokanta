const updateDatabase = require('../utils/updateDatabase')
const evolve = require('../utils/evolveObjAsync')
const L = require('partial.lenses')

/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const eventsDb = params.context.getModel('events')
  const eventProgramDb = params.context.getModel('event-program')

  await updateDatabase(eventsDb, evolve({
    program: {
      introductions: {
        program: L.modifyAsync(L.elems, inlineProgram),
      },
      danceSets: L.modifyAsync([L.elems, 'program', L.elems], inlineProgram),
    }
  }))

  async function inlineProgram(row) {
    const {eventProgramId, danceId, __typename, ...rowProps } = row
    if (row.__typename === 'Dance') return {
      ...rowProps,
      type: __typename,
      dance: danceId,
    }
    if (row.__typename !== 'EventProgram') {
      return {
        type: __typename,
        ...rowProps
      }
    }

    const program = await eventProgramDb.get(eventProgramId)
    delete program._id

    return {
      ...rowProps,
      type: __typename,
      eventProgram: program
    }
  }

}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
