import { MigrationFn } from '../umzug.context'
import { omit } from 'ramda'

export const up: MigrationFn = async params => {
  params.context.updateDatabase('events', omit(['workshopVersions']))
}

export const down: MigrationFn = async _params => {}
