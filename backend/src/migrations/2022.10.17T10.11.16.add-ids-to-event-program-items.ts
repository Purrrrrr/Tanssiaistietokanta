import * as L from 'partial.lenses';
import R from 'ramda';
import guid from '../utils/guid';
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')

  const events = await eventsDb.findAsync({})

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

export const down: MigrationFn = async () => {};
