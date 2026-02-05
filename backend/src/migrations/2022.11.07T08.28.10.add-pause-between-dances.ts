import updateDatabase from '../utils/updateDatabase'
import * as L from 'partial.lenses'
import { MigrationFn } from '../umzug.context'

const DEFAULT_PAUSE_BETWEEN_DANCES = 3 * 60

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')
  await updateDatabase(eventsDb, L.set(['program', 'pauseBetweenDances'], DEFAULT_PAUSE_BETWEEN_DANCES))
}

export const down: MigrationFn = async () => {}
