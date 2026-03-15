import { MigrationFn } from '../../src/umzug.context'
import { omit } from 'es-toolkit'
import { testDances } from '../fixtures/test-dances'
import { SkipAccessControl } from '../../src/services/access/hooks'

export const up: MigrationFn = async params => {
  const { getService } = params.context
  const danceService = getService('dances')

  await Promise.all(testDances.map(async dance => {
    if (danceService.create === undefined) throw new Error('dance service does not support create')
    const { _id } = await danceService.create(omit(dance, ['_id']), { [SkipAccessControl]: true })
    dance._id = _id
  }))
}
export const down: MigrationFn = async () => {}
