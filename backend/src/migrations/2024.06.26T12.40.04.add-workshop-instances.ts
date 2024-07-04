import { MigrationFn } from '../umzug.context';
import guid from '../utils/guid';

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')
  const events = await eventsDb.findAsync({})
  const beginDates: Map<string, string> = new Map(
    events.map(event => [event._id, event.beginDate])
  )

  await params.context.updateDatabase('workshops', 
    ({ danceIds, ...workshop}: any) => { 
      return {
        ...workshop,
        instances: [
          {
            _id: guid(),
            danceIds,
            description: '',
            abbreviation: '',
            dateTime: `${beginDates.get(workshop.eventId) ?? '2000-01-01'}T12:00:00.000`,
            durationInMinutes: 105,
          }
        ],
        instanceSpecificDances: false,
      }
    }
  )
}

export const down: MigrationFn = async () => {};
