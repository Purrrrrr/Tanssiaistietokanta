import { MigrationFn } from '../../src/umzug.context'
import { omit } from 'es-toolkit'
import { testEventRoles } from '../fixtures/test-event-roles'
import { SkipAccessControl } from '../../src/services/access/hooks'

export const up: MigrationFn = async params => {
  const { getService } = params.context
  const eventRolesService = getService('eventRoles')

  if (eventRolesService.create === undefined) throw new Error('eventRoles service does not support create')

  await Promise.all(
    testEventRoles.map(async role => {
      const created = await eventRolesService.create?.(omit(role, ['_id']), { [SkipAccessControl]: true })
      role._id = created._id
    }),
  )
}

export const down: MigrationFn = async () => {}
