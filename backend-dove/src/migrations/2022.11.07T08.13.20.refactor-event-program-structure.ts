import updateDatabase from '../utils/updateDatabase';
import * as L from 'partial.lenses';
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')

  await updateDatabase(eventsDb, L.modify(
    'program',
    (program: any) => ({
      ...program,
      introductions: {
        program: program?.introductions ?? [],
      },
      danceSets: program?.danceSets ?? [],
    })
  ))
}

export const down: MigrationFn = async () => {};
