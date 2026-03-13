import { omit } from 'es-toolkit'
import { MigrationFn } from '../../src/umzug.context'
import { testUsers } from '../fixtures/test-users'

export const up: MigrationFn = async params => {
  const { getService } = params.context

  const userService = getService('users')
  await Promise.all(testUsers.map(async user => {
    if (userService.create === undefined) throw new Error('User service does not support create')
    const { _id } = await userService.create(omit(user, ['_id']))
    user._id = _id
  }))
}
export const down: MigrationFn = async _params => {}
