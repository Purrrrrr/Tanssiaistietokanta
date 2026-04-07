import { MigrationFn } from '../../src/umzug.context'
import { omit } from 'es-toolkit'
import { canonicalVolunteer, duplicateVolunteer, initTestVolunteers } from '../fixtures/test-volunteers'
import { SkipAccessControl } from '../../src/services/access/hooks'

export const up: MigrationFn = async params => {
  const { getService } = params.context
  const volunteersService = getService('volunteers')

  if (volunteersService.create === undefined) throw new Error('volunteers service does not support create')

  const canonical = await volunteersService.create?.(omit(canonicalVolunteer, ['_id']), { [SkipAccessControl]: true })
  canonicalVolunteer._id = canonical._id

  initTestVolunteers()

  const duplicate = await volunteersService.create?.(
    omit(duplicateVolunteer, ['_id']),
    { [SkipAccessControl]: true },
  )
  duplicateVolunteer._id = duplicate._id
}

export const down: MigrationFn = async () => {}
