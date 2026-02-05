import { MigrationFn } from '../umzug.context'
import * as L from 'partial.lenses'

export const up: MigrationFn = async params => {
  params.context.updateDatabase('users', L.set(
    'roles',
    ['user', 'admin'],
  ))
}
export const down: MigrationFn = async _params => {}
