import { MigrationFn } from '../../src/umzug.context'
import { omit } from 'es-toolkit'
import { testWorkshops, initTestWorkshops } from '../fixtures/test-workshops'
import { SkipAccessControl } from '../../src/services/access/hooks'

export const up: MigrationFn = async params => {
  const { getService } = params.context
  const workshopService = getService('workshops')

  if (workshopService.create === undefined) throw new Error('workshops service does not support create')

  initTestWorkshops()
  await Promise.all(
    testWorkshops.map(async workshop => {
      const created = await workshopService.create?.(omit(workshop, ['_id']), { [SkipAccessControl]: true })
      workshop._id = created._id
    }),
  )
}

export const down: MigrationFn = async () => {}
