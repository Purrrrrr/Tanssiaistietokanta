import * as L from 'partial.lenses'
import R from 'ramda'
import evolve from '../utils/evolveObjAsync'
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')
  const eventProgramDb = params.context.getModel('event-program')

  console.log(L)

  const events = await eventsDb.findAsync({})

  for (const event of events) {
    if (!event.program || event.program.length == 0) continue

    const newEvent = await evolve(
      {
        program: {
          introductions: L.modifyAsync(L.elems, modEventProgram),
          danceSets: L.modifyAsync(
            [
              L.elems, 'program', L.elems,
              L.when(R.propEq('__typename', 'OtherProgram'))
            ],
            modEventProgram
          )
        }
      },
      event
    )

    await eventsDb.updateAsync({ _id: event._id}, newEvent)
  }

  async function modEventProgram(item: any) {
    const eventProgramId  = await storeEventProgram(item, eventProgramDb)
    return { eventProgramId, __typename: 'EventProgram' }
  }
}

async function storeEventProgram(eventProgram: any, eventProgramDb: any) {
  const { name, description, duration } = eventProgram

  const { _id } = await eventProgramDb.insertAsync({ name, description, duration })
  return _id
}

export const down: MigrationFn = async () => {};
