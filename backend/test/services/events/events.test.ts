import { expect, use } from 'chai'
import { prop } from 'ramda'
import { app } from '../../../src/app'
import type { Events, EventsData } from './events.schema'
import { adminUser, normalUser, teacherUser } from '../../fixtures/test-users'
import { publicTestEvent, limitedTestEvent } from '../../fixtures/test-events'
import chaiAsPromised from 'chai-as-promised'

use(chaiAsPromised)

const eventToCreate = {
  name: 'Foobar\'s Test Ball',
  beginDate: '2026-12-31',
  endDate: '2026-12-31',
  // TODO add accessControl
} as EventsData

describe('events service', () => {
  before(async () => {
    await app.listen(app.get('port'))
  })

  after(async () => {
    await app.teardown()
  })

  it('registered the service', () => {
    const service = app.service('events')

    expect(service, 'Registered the service').to.exist
  })

  describe('find', () => {
    it('returns only public events without authentication', async () => {
      const events = await app.service('events').find({})
      const names = events.map(prop('name'))

      expect(names, 'Public event is visible').to.include(publicTestEvent.name)
      expect(names, 'Limited event is not visible').to.not.include(limitedTestEvent.name)
    })

    it('returns all events for admin', async () => {
      const events = await app.service('events').find({ user: adminUser })
      const names = events.map(prop('name'))

      expect(names, 'Public event is visible').to.include(publicTestEvent.name)
      expect(names, 'Limited event is visible to admin').to.include(limitedTestEvent.name)
    })

    it('returns all events for user with organizer grant', async () => {
      const events = await app.service('events').find({ user: normalUser })
      const names = events.map(prop('name'))

      expect(names, 'Public event is visible').to.include(publicTestEvent.name)
      expect(names, 'Limited event is visible to organizer').to.include(limitedTestEvent.name)
    })

    it('returns limited event for user with teacher grant', async () => {
      const events = await app.service('events').find({ user: teacherUser })
      const names = events.map(prop('name'))

      expect(names, 'Public event is visible').to.include(publicTestEvent.name)
      expect(names, 'Limited event is visible to teacher').to.include(limitedTestEvent.name)
    })
  })

  describe('get', () => {
    it('gets public event without authentication', async () => {
      const event = await app.service('events').get(publicTestEvent._id) as Events

      expect(event._id).to.equal(publicTestEvent._id)
      expect(event.name).to.equal(publicTestEvent.name)
    })

    it('fails to get limited event without authentication', async () => {
      expect(
        app.service('events').get(limitedTestEvent._id),
      ).to.be.rejectedWith('Access denied')
    })

    it('gets limited event as user with organizer grant', async () => {
      const event = await app.service('events').get(limitedTestEvent._id, { user: normalUser }) as Events

      expect(event._id).to.equal(limitedTestEvent._id)
      expect(event.name).to.equal(limitedTestEvent.name)
    })

    it('gets limited event as user with teacher grant', async () => {
      const event = await app.service('events').get(limitedTestEvent._id, { user: teacherUser }) as Events

      expect(event._id).to.equal(limitedTestEvent._id)
      expect(event.name).to.equal(limitedTestEvent.name)
    })

    it('gets limited event as admin', async () => {
      const event = await app.service('events').get(limitedTestEvent._id, { user: adminUser }) as Events

      expect(event._id).to.equal(limitedTestEvent._id)
    })
  })

  describe('create', () => {
    it('fails to create an event without authentication', async () => {
      expect(
        app.service('events').create(eventToCreate),
      ).to.be.rejectedWith('Access denied')
    })

    it('creates and removes an event as normalUser', async () => {
      const created = await app.service('events').create(eventToCreate, { user: normalUser }) as Events

      expect(created._id).to.exist
      expect(created.name).to.equal(eventToCreate.name)

      await app.service('events').remove(created._id, { user: adminUser })
      const events = await app.service('events').find({ user: adminUser })
      expect(events.map(prop('_id')), 'Created event is removed').to.not.include(created._id)
    })

    it('creates and removes an event as admin', async () => {
      const created = await app.service('events').create(eventToCreate, { user: adminUser }) as Events

      expect(created._id).to.exist
      await app.service('events').remove(created._id, { user: adminUser })
    })
  })

  describe('patch', () => {
    it('fails to patch an event without authentication', async () => {
      expect(
        app.service('events').patch(publicTestEvent._id, { name: 'Hacked' }),
      ).to.be.rejectedWith('Access denied')
    })

    it('fails to patch an event as user without a role on the event', async () => {
      // normalUser has no role on the public event (only on the limited event)
      expect(
        app.service('events').patch(publicTestEvent._id, { name: 'Hacked' }, { user: normalUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('fails to patch an event as teacher without a role on the event', async () => {
      // teacherUser has no role on the public event (only on the limited event)
      expect(
        app.service('events').patch(publicTestEvent._id, { name: 'Hacked' }, { user: teacherUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('patches limited event as organizer (normalUser)', async () => {
      const patched = await app.service('events').patch(
        limitedTestEvent._id, { name: 'Patched Ball' }, { user: normalUser },
      ) as Events

      expect(patched.name).to.equal('Patched Ball')

      // Restore
      await app.service('events').patch(
        limitedTestEvent._id, { name: limitedTestEvent.name }, { user: adminUser },
      )
    })

    it('patches limited event as teacher (teacherUser)', async () => {
      const patched = await app.service('events').patch(
        limitedTestEvent._id, { name: 'Teacher Patched Ball' }, { user: teacherUser },
      ) as Events

      expect(patched.name).to.equal('Teacher Patched Ball')

      // Restore
      await app.service('events').patch(
        limitedTestEvent._id, { name: limitedTestEvent.name }, { user: adminUser },
      )
    })

    it('patches any event as admin', async () => {
      const patched = await app.service('events').patch(
        publicTestEvent._id, { name: 'Patched Public Ball' }, { user: adminUser },
      ) as Events

      expect(patched.name).to.equal('Patched Public Ball')

      // Restore
      await app.service('events').patch(
        publicTestEvent._id, { name: publicTestEvent.name }, { user: adminUser },
      )
    })
  })

  describe('remove', () => {
    it('fails to remove an event without authentication', async () => {
      expect(
        app.service('events').remove(publicTestEvent._id),
      ).to.be.rejectedWith('Access denied')
    })

    it('fails to remove an event as user without organizer role', async () => {
      // normalUser has no role on the public event
      expect(
        app.service('events').remove(publicTestEvent._id, { user: normalUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('fails to remove an event as teacher (teacher role cannot delete)', async () => {
      expect(
        app.service('events').remove(limitedTestEvent._id, { user: teacherUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('removes an event as organizer (normalUser)', async () => {
      // Create a temporary event and grant normalUser organizer access via admin
      const temp = await app.service('events').create(
        {
          name: 'Temp Limited Ball', beginDate: '2026-12-01', endDate: '2026-12-01',
          accessControl: {
            viewAccess: 'limited', grants: [{ _id: 'g1', principal: `user:${normalUser._id}`, role: 'organizer' }],
          },
        } as any as EventsData,
        { user: adminUser },
      ) as Events

      await app.service('events').remove(temp._id, { user: normalUser })

      const events = await app.service('events').find({ user: adminUser })
      expect(events.map(prop('_id')), 'Event was removed').to.not.include(temp._id)
    })

    it('removes an event as admin', async () => {
      const temp = await app.service('events').create(eventToCreate, { user: adminUser }) as Events
      await app.service('events').remove(temp._id, { user: adminUser })

      const events = await app.service('events').find({ user: adminUser })
      expect(events.map(prop('_id')), 'Event was removed').to.not.include(temp._id)
    })
  })

  describe('accessControl', () => {
    it('fails to update accessControl without organizer role', async () => {
      // normalUser has no role on the public event
      expect(
        app.service('events').patch(
          publicTestEvent._id,
          { accessControl: { viewAccess: 'public', grants: [] } } as any,
          { user: normalUser },
        ),
      ).to.be.rejectedWith('Manage access denied')
    })

    it('fails to update accessControl as teacher (teacher role cannot manage access)', async () => {
      expect(
        app.service('events').patch(
          limitedTestEvent._id,
          { accessControl: { viewAccess: 'public', grants: [] } } as any,
          { user: teacherUser },
        ),
      ).to.be.rejectedWith('Manage access denied')
    })

    it('updates accessControl as organizer', async () => {
      const updated = await app.service('events').patch(
        limitedTestEvent._id,
        { accessControl: { viewAccess: 'public', grants: [] } } as any,
        { user: normalUser },
      ) as Events

      expect(updated.accessControl.viewAccess).to.equal('public')

      // Restore
      await app.service('events').patch(
        limitedTestEvent._id,
        { accessControl: limitedTestEvent.accessControl } as any,
        { user: adminUser },
      )
    })
  })
})
