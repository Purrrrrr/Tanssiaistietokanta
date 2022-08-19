const L = require('partial.lenses');
const R = require('ramda');
const evolve = require('../utils/evolveObjAsync');

/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const {
    events: eventsDb,
    ['event-program']: eventProgramDb
  } = params.context.models

  const events = await eventsDb.findAsync()

  for (const event of events) {
    if (!event.program || event.program.length == 0) continue;

    const newEvent = await evolve(
      {
        program: {
          introductions: L.modifyAsync(L.elems, modEventProgram),
          danceSets: L.modifyAsync(
            [
              L.elems, 'program', L.elems,
              L.when(R.propEq('__typename', 'OtherProgram'))
            ],
            modEventProgram,
          ),
        }
      },
      event
    )

    await eventsDb.updateAsync({ _id: event._id}, newEvent)
  }

  async function modEventProgram(item) {
    const eventProgramId  = await storeEventProgram(item, eventProgramDb)
    return { eventProgramId, __typename: 'EventProgram' }
  }

};

async function storeEventProgram(eventProgram, eventProgramDb) {
  const { name, description, duration } = eventProgram

  const { _id } = await eventProgramDb.insertAsync({ name, description, duration })
  return _id
}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async params => {};
