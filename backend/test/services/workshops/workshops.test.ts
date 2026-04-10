import { expect, use } from 'chai'
import { prop } from 'ramda'
import { app } from '../../../src/app'
import type { Workshops, WorkshopsData } from './workshops.schema'
import { adminUser, normalUser, teacherUser } from '../../fixtures/test-users'
import { publicTestEvent, limitedTestEvent } from '../../fixtures/test-events'
import { publicEventWorkshop, limitedEventWorkshop } from '../../fixtures/test-workshops'
import chaiAsPromised from 'chai-as-promised'

use(chaiAsPromised)

const workshopToCreate = {
  name: 'Temp Workshop',
  abbreviation: 'TW',
  description: 'A temporary workshop',
  instances: [],
  instanceSpecificDances: false,
} as Omit<WorkshopsData, 'eventId'>

describe('workshops service', () => {
  before(async () => {
    await app.listen(app.get('port'))
  })

  after(async () => {
    await app.teardown()
  })

  it('registered the service', () => {
    const service = app.service('workshops')

    expect(service, 'Registered the service').to.exist
  })

  describe('find', () => {
    it('returns workshops for public event without authentication', async () => {
      const workshops = await app.service('workshops').find({ query: { eventId: publicTestEvent._id } })
      const names = workshops.map(prop('name'))

      expect(names, 'Public event workshop is visible').to.include(publicEventWorkshop.name)
    })

    it('does not return workshops for limited event without authentication', async () => {
      const workshops = await app.service('workshops').find({ query: { eventId: limitedTestEvent._id } })
      const names = workshops.map(prop('name'))

      expect(names, 'Limited event workshop is not visible').to.not.include(limitedEventWorkshop.name)
    })

    it('returns workshops for limited event as admin', async () => {
      const workshops = await app.service('workshops').find({ query: { eventId: limitedTestEvent._id }, user: adminUser })
      const names = workshops.map(prop('name'))

      expect(names, 'Limited event workshop is visible to admin').to.include(limitedEventWorkshop.name)
    })

    it('returns workshops for limited event as organizer', async () => {
      const workshops = await app.service('workshops').find({ query: { eventId: limitedTestEvent._id }, user: normalUser })
      const names = workshops.map(prop('name'))

      expect(names, 'Limited event workshop is visible to organizer').to.include(limitedEventWorkshop.name)
    })

    it('returns workshops for limited event as teacher', async () => {
      const workshops = await app.service('workshops').find({ query: { eventId: limitedTestEvent._id }, user: teacherUser })
      const names = workshops.map(prop('name'))

      expect(names, 'Limited event workshop is visible to teacher').to.include(limitedEventWorkshop.name)
    })
  })

  describe('get', () => {
    it('gets workshop from public event without authentication', async () => {
      const workshop = await app.service('workshops').get(publicEventWorkshop._id) as Workshops

      expect(workshop._id).to.equal(publicEventWorkshop._id)
      expect(workshop.name).to.equal(publicEventWorkshop.name)
    })

    it('fails to get workshop from limited event without authentication', async () => {
      expect(
        app.service('workshops').get(limitedEventWorkshop._id),
      ).to.be.rejectedWith('Access denied')
    })

    it('gets workshop from limited event as organizer', async () => {
      const workshop = await app.service('workshops').get(limitedEventWorkshop._id, { user: normalUser }) as Workshops

      expect(workshop._id).to.equal(limitedEventWorkshop._id)
      expect(workshop.name).to.equal(limitedEventWorkshop.name)
    })

    it('gets workshop from limited event as teacher', async () => {
      const workshop = await app.service('workshops').get(limitedEventWorkshop._id, { user: teacherUser }) as Workshops

      expect(workshop._id).to.equal(limitedEventWorkshop._id)
      expect(workshop.name).to.equal(limitedEventWorkshop.name)
    })

    it('gets workshop from limited event as admin', async () => {
      const workshop = await app.service('workshops').get(limitedEventWorkshop._id, { user: adminUser }) as Workshops

      expect(workshop._id).to.equal(limitedEventWorkshop._id)
    })
  })

  describe('create', () => {
    it('fails to create a workshop without authentication', async () => {
      expect(
        app.service('workshops').create({ ...workshopToCreate, eventId: limitedTestEvent._id } as WorkshopsData),
      ).to.be.rejectedWith('Access denied')
    })

    it('fails to create a workshop without a role on the event', async () => {
      // normalUser has no role on the public event
      expect(
        app.service('workshops').create({ ...workshopToCreate, eventId: publicTestEvent._id } as WorkshopsData, { user: normalUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('creates and removes a workshop as organizer', async () => {
      const created = await app.service('workshops').create(
        { ...workshopToCreate, eventId: limitedTestEvent._id } as WorkshopsData,
        { user: normalUser },
      ) as Workshops

      expect(created._id).to.exist
      expect(created.name).to.equal(workshopToCreate.name)

      await app.service('workshops').remove(created._id, { user: adminUser })
    })

    it('creates and removes a workshop as teacher', async () => {
      const created = await app.service('workshops').create(
        { ...workshopToCreate, eventId: limitedTestEvent._id } as WorkshopsData,
        { user: teacherUser },
      ) as Workshops

      expect(created._id).to.exist

      await app.service('workshops').remove(created._id, { user: adminUser })
    })

    it('creates and removes a workshop as admin', async () => {
      const created = await app.service('workshops').create(
        { ...workshopToCreate, eventId: publicTestEvent._id } as WorkshopsData,
        { user: adminUser },
      ) as Workshops

      expect(created._id).to.exist

      await app.service('workshops').remove(created._id, { user: adminUser })
    })
  })

  describe('patch', () => {
    it('fails to patch a workshop without authentication', async () => {
      expect(
        app.service('workshops').patch(limitedEventWorkshop._id, { name: 'Hacked' }),
      ).to.be.rejectedWith('Access denied')
    })

    it('fails to patch a workshop without a role on the event', async () => {
      // normalUser has no role on the public event
      expect(
        app.service('workshops').patch(publicEventWorkshop._id, { name: 'Hacked' }, { user: normalUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('patches limited event workshop as organizer', async () => {
      const patched = await app.service('workshops').patch(
        limitedEventWorkshop._id, { name: 'Patched Workshop' }, { user: normalUser },
      ) as Workshops

      expect(patched.name).to.equal('Patched Workshop')

      // Restore
      await app.service('workshops').patch(
        limitedEventWorkshop._id, { name: limitedEventWorkshop.name }, { user: adminUser },
      )
    })

    it('patches limited event workshop as teacher', async () => {
      const patched = await app.service('workshops').patch(
        limitedEventWorkshop._id, { name: 'Teacher Patched Workshop' }, { user: teacherUser },
      ) as Workshops

      expect(patched.name).to.equal('Teacher Patched Workshop')

      // Restore
      await app.service('workshops').patch(
        limitedEventWorkshop._id, { name: limitedEventWorkshop.name }, { user: adminUser },
      )
    })

    it('patches any workshop as admin', async () => {
      const patched = await app.service('workshops').patch(
        publicEventWorkshop._id, { name: 'Admin Patched Workshop' }, { user: adminUser },
      ) as Workshops

      expect(patched.name).to.equal('Admin Patched Workshop')

      // Restore
      await app.service('workshops').patch(
        publicEventWorkshop._id, { name: publicEventWorkshop.name }, { user: adminUser },
      )
    })
  })

  describe('remove', () => {
    it('fails to remove a workshop without authentication', async () => {
      expect(
        app.service('workshops').remove(limitedEventWorkshop._id),
      ).to.be.rejectedWith('Access denied')
    })

    it('fails to remove a workshop as teacher (teacher role cannot delete)', async () => {
      expect(
        app.service('workshops').remove(limitedEventWorkshop._id, { user: teacherUser }),
      ).to.be.rejectedWith('Access denied')
    })

    it('removes a workshop as organizer', async () => {
      const temp = await app.service('workshops').create(
        { ...workshopToCreate, eventId: limitedTestEvent._id } as WorkshopsData,
        { user: adminUser },
      ) as Workshops

      await app.service('workshops').remove(temp._id, { user: normalUser })

      const workshops = await app.service('workshops').find({ query: { eventId: limitedTestEvent._id }, user: adminUser })
      expect(workshops.map(prop('_id')), 'Workshop was removed').to.not.include(temp._id)
    })

    it('removes a workshop as admin', async () => {
      const temp = await app.service('workshops').create(
        { ...workshopToCreate, eventId: publicTestEvent._id } as WorkshopsData,
        { user: adminUser },
      ) as Workshops

      await app.service('workshops').remove(temp._id, { user: adminUser })

      const workshops = await app.service('workshops').find({ query: { eventId: publicTestEvent._id }, user: adminUser })
      expect(workshops.map(prop('_id')), 'Workshop was removed').to.not.include(temp._id)
    })
  })
})
