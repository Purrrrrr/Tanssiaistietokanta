import { MigrationFn } from '../../src/umzug.context'
import { testUsers } from '../fixtures/test-users'

export const up: MigrationFn = async params => {
  const { getService } = params.context

  const userService = getService('users')
  await Promise.all(testUsers.map(user => userService.create?.(user)))
}
export const down: MigrationFn = async _params => {}
