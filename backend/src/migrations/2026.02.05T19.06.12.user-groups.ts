import { MigrationFn } from '../umzug.context'
import * as L from 'partial.lenses'

export const up: MigrationFn = async params => {
  params.context.updateDatabase('users', L.set(
    'groups',
    ['users', 'admins'],
  ))
}
export const down: MigrationFn = async _params => {}
