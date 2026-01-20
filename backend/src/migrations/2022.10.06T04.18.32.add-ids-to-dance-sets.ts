import * as L from 'partial.lenses'
import guid from '../utils/random-id';
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')

  const events = await eventsDb.findAsync({})

  for (const event of events) {
    if (!event.program || event.program.length == 0) continue

    const newEvent = L.modify(
      ['program', 'danceSets', L.elems, '_id'],
      guid,
      event
    )

    await eventsDb.updateAsync({ _id: event._id}, newEvent)
  }

}

export const down: MigrationFn = async () => {};
