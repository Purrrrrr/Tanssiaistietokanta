import { MigrationFn } from '../umzug.context'
import { omit } from 'ramda'

export const up: MigrationFn = async params => {
  // Fix timestamp forgotten in the previous migration
  await params.context.updateDatabase('eventVolunteers', omit(['acceptedRoles']))
}

export const down: MigrationFn = async _params => {}
