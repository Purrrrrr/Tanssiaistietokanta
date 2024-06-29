import { MigrationFn } from '../umzug.context';
import guid from '../utils/guid';

export const up: MigrationFn = async params => {
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
            dateTime: '0000-01-01T00:00:00.000',
            durationInMinutes: 105,
          }
        ]
      }
    }
  )
}

export const down: MigrationFn = async () => {};
