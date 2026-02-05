import updateDatabase from '../utils/updateDatabase'
import * as L from 'partial.lenses'
import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')

  await updateDatabase(eventsDb, L.modify(
    ['program', 'danceSets', L.elems],
    ({ name, ...rest }: any) => ({ title: name, ...rest }),
  ))
}

export const down: MigrationFn = async () => {}
