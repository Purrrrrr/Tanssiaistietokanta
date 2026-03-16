import type { EventsData } from '../../src/client'
import type { EventAccessData } from '../../src/services/events/events.schema'
import { normalUser, teacherUser } from './test-users'

type EventFixture = { _id: string } & Pick<EventsData, 'name' | 'beginDate' | 'endDate'> & { accessControl: EventAccessData }

export const publicTestEvent: EventFixture = {
  _id: '',
  name: 'Public Test Ball',
  beginDate: '2026-01-01',
  endDate: '2026-01-01',
  accessControl: {
    viewAccess: 'public',
    grants: [],
  },
}

export const limitedTestEvent: EventFixture = {
  _id: '',
  name: 'Limited Test Ball',
  beginDate: '2026-06-01',
  endDate: '2026-06-01',
  accessControl: {
    viewAccess: 'limited',
    grants: [],
  },
}

// User id's are not available at the time of defining the fixtures, so we need to set the grants in a separate function
export const initTestEvents = () => {
  limitedTestEvent.accessControl.grants = [
    { _id: 'grant-organizer-1', principal: `user:${normalUser._id}`, role: 'organizer' },
    { _id: 'grant-teacher-1', principal: `user:${teacherUser._id}`, role: 'teacher' },
  ]
}

export const testEvents = [publicTestEvent, limitedTestEvent] as const
