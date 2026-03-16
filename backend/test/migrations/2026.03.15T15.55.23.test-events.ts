import { MigrationFn } from '../../src/umzug.context'
import { omit } from 'es-toolkit'
import { publicTestEvent, limitedTestEvent, initTestEvents } from '../fixtures/test-events'
import { SkipAccessControl } from '../../src/services/access/hooks'

export const up: MigrationFn = async params => {
  const { getService } = params.context
  const eventService = getService('events')

  if (eventService.create === undefined) throw new Error('events service does not support create')

  initTestEvents()
  const [publicEvent, limitedEvent] = await Promise.all([
    eventService.create(omit(publicTestEvent, ['_id']), { [SkipAccessControl]: true }),
    eventService.create(omit(limitedTestEvent, ['_id']), { [SkipAccessControl]: true }),
  ])

  publicTestEvent._id = publicEvent._id
  limitedTestEvent._id = limitedEvent._id
}

export const down: MigrationFn = async () => {}
