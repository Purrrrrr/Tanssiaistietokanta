import { expect, use } from 'chai'
import { prop } from 'ramda'
import { app } from '../../../src/app'
import type { EventVolunteerAssignments, EventVolunteerAssignmentsData } from './eventVolunteerAssignments.schema'
import { adminUser, normalUser, teacherUser } from '../../fixtures/test-users'
import { publicTestEvent, limitedTestEvent } from '../../fixtures/test-events'
import { canonicalVolunteer } from '../../fixtures/test-volunteers'
import { testTeacherRole } from '../../fixtures/test-event-roles'
import { publicEventWorkshop, limitedEventWorkshop } from '../../fixtures/test-workshops'
import chaiAsPromised from 'chai-as-promised'
import { SkipAccessControl } from '../../../src/services/access/hooks'

use(chaiAsPromised)

function assignmentData(overrides: Partial<EventVolunteerAssignmentsData> = {}): EventVolunteerAssignmentsData {
  return {
    eventId: limitedTestEvent._id,
    volunteerId: canonicalVolunteer._id,
    roleId: testTeacherRole._id,
    workshopId: null,
    ...overrides,
  }
}

describe('eventVolunteerAssignments service', () => {
  before(async () => {
    await app.listen(app.get('port'))
  })

  after(async () => {
    await app.teardown()
  })

  it('registered the service', () => {
    const service = app.service('eventVolunteerAssignments')
    expect(service, 'Registered the service').to.exist
  })

  describe('find', () => {
    let created: EventVolunteerAssignments

    before(async () => {
      created = await app.service('eventVolunteerAssignments').create(
        assignmentData(),
        { [SkipAccessControl]: true },
      ) as EventVolunteerAssignments
    })

    after(async () => {
      await app.service('eventVolunteerAssignments').remove(created._id, { [SkipAccessControl]: true })
    })

    it('returns empty list without authentication for a limited event', async () => {
      const results = await app.service('eventVolunteerAssignments').find({
        query: { eventId: limitedTestEvent._id },
      })
      expect(results, 'No assignments visible without auth').to.have.length(0)
    })

    it('returns assignments for event organizer', async () => {
      const results = await app.service('eventVolunteerAssignments').find({
        query: { eventId: limitedTestEvent._id },
        user: normalUser,
      })
      const ids = results.map(prop('_id'))
      expect(ids, 'Assignment is visible to organizer').to.include(created._id)
    })

    it('returns empty list for teacher (teacher cannot modify-volunteers)', async () => {
      const results = await app.service('eventVolunteerAssignments').find({
        query: { eventId: limitedTestEvent._id },
        user: teacherUser,
      })
      expect(results, 'No assignments visible to teacher').to.have.length(0)
    })

    it('filters by workshopId when provided', async () => {
      const withWorkshop = await app.service('eventVolunteerAssignments').create(
        assignmentData({ workshopId: limitedEventWorkshop._id }),
        { [SkipAccessControl]: true },
      ) as EventVolunteerAssignments

      try {
        const results = await app.service('eventVolunteerAssignments').find({
          query: { eventId: limitedTestEvent._id, workshopId: limitedEventWorkshop._id },
          user: normalUser,
        })
        const ids = results.map(prop('_id'))
        expect(ids, 'Workshop-specific assignment is found').to.include(withWorkshop._id)
        expect(ids, 'Event-level assignment is not in workshop results').to.not.include(created._id)
      } finally {
        await app.service('eventVolunteerAssignments').remove(withWorkshop._id, { [SkipAccessControl]: true })
      }
    })
  })

  describe('get', () => {
    let created: EventVolunteerAssignments

    before(async () => {
      created = await app.service('eventVolunteerAssignments').create(
        assignmentData(),
        { [SkipAccessControl]: true },
      ) as EventVolunteerAssignments
    })

    after(async () => {
      await app.service('eventVolunteerAssignments').remove(created._id, { [SkipAccessControl]: true })
    })

    it('fails to get an assignment without authentication', async () => {
      expect(
        app.service('eventVolunteerAssignments').get(created._id),
      ).to.be.rejectedWith('Access denied')
    })

    it('gets an assignment as organizer', async () => {
      const result = await app.service('eventVolunteerAssignments').get(created._id, { user: normalUser }) as EventVolunteerAssignments

      expect(result._id).to.equal(created._id)
      expect(result.eventId).to.equal(limitedTestEvent._id)
      expect(result.volunteerId).to.equal(canonicalVolunteer._id)
    })

    it('fails to get an assignment as teacher', async () => {
      expect(
        app.service('eventVolunteerAssignments').get(created._id, { user: teacherUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('gets any assignment as admin', async () => {
      const result = await app.service('eventVolunteerAssignments').get(created._id, { user: adminUser }) as EventVolunteerAssignments

      expect(result._id).to.equal(created._id)
    })
  })

  describe('create', () => {
    it('fails to create an assignment without authentication', async () => {
      expect(
        app.service('eventVolunteerAssignments').create(assignmentData()),
      ).to.be.rejectedWith('Access denied')
    })

    it('fails to create an assignment as teacher', async () => {
      expect(
        app.service('eventVolunteerAssignments').create(assignmentData(), { user: teacherUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('creates and removes an assignment as organizer', async () => {
      const created = await app.service('eventVolunteerAssignments').create(
        assignmentData(),
        { user: normalUser },
      ) as EventVolunteerAssignments

      expect(created._id).to.exist
      expect(created.eventId).to.equal(limitedTestEvent._id)
      expect(created.workshopId).to.be.null

      await app.service('eventVolunteerAssignments').remove(created._id, { user: normalUser })
    })

    it('creates an assignment with a workshop', async () => {
      const created = await app.service('eventVolunteerAssignments').create(
        assignmentData({ workshopId: limitedEventWorkshop._id }),
        { user: normalUser },
      ) as EventVolunteerAssignments

      expect(created.workshopId).to.equal(limitedEventWorkshop._id)

      await app.service('eventVolunteerAssignments').remove(created._id, { user: normalUser })
    })

    it('creates an assignment as admin', async () => {
      const created = await app.service('eventVolunteerAssignments').create(
        assignmentData({ eventId: publicTestEvent._id }),
        { user: adminUser },
      ) as EventVolunteerAssignments

      expect(created._id).to.exist

      await app.service('eventVolunteerAssignments').remove(created._id, { user: adminUser })
    })

    it('enforces unique constraint on eventId+workshopId+roleId+volunteerId', async () => {
      const first = await app.service('eventVolunteerAssignments').create(
        assignmentData(),
        { [SkipAccessControl]: true },
      ) as EventVolunteerAssignments

      try {
        expect(
          app.service('eventVolunteerAssignments').create(assignmentData(), { [SkipAccessControl]: true }),
        ).to.be.rejected

      } finally {
        await app.service('eventVolunteerAssignments').remove(first._id, { [SkipAccessControl]: true })
      }
    })
  })

  describe('remove', () => {
    it('fails to remove an assignment without authentication', async () => {
      const created = await app.service('eventVolunteerAssignments').create(
        assignmentData(),
        { [SkipAccessControl]: true },
      ) as EventVolunteerAssignments

      try {
        expect(
          app.service('eventVolunteerAssignments').remove(created._id),
        ).to.be.rejectedWith('Access denied')
      } finally {
        await app.service('eventVolunteerAssignments').remove(created._id, { [SkipAccessControl]: true })
      }
    })

    it('removes an assignment as organizer', async () => {
      const created = await app.service('eventVolunteerAssignments').create(
        assignmentData(),
        { user: normalUser },
      ) as EventVolunteerAssignments

      await app.service('eventVolunteerAssignments').remove(created._id, { user: normalUser })

      const found = await app.service('eventVolunteerAssignments').find({
        [SkipAccessControl]: true,
        query: { _id: created._id },
      })
      expect(found, 'Assignment was removed').to.have.length(0)
    })
  })
})
