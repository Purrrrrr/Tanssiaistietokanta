import R from 'ramda'
import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('volunteers', R.omit(['contact_details']))
}

export const down: MigrationFn = async () => {}
