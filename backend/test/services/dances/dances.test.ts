// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import { expect, use } from 'chai'
import { omit, pick, prop } from 'ramda'
import { app } from '../../../src/app'
import { Dances, DancesData } from './dances.schema'
import { adminUser, enabledTestUsers as testUsers } from '../../fixtures/test-users'
import chaiAsPromised from 'chai-as-promised'
import { testDances } from '../../fixtures/test-dances'
import type { Events, EventsData } from '../events/events.schema'
import type { Workshops, WorkshopsData } from '../workshops/workshops.schema'

use(chaiAsPromised)

const danceToCreate = {
  name: 'Foobar\'s Maggot',
  description: 'A dance for testing',
  duration: 123,
  prelude: 'Prelude',
  formation: 'Formation',
  source: 'Source',
  category: 'Category',
  instructions: 'Instructions',
  remarks: 'Remarks',
  wikipage: null,
  wikipageName: null,
  slideStyleId: null,
  tags: {},
}

describe('dances service', () => {
  before(async () => {
    await app.listen(app.get('port'))
  })

  after(async () => {
    await app.teardown()
  })

  it('registered the service', () => {
    const service = app.service('dances')

    expect(service, 'Registered the service').to.exist
  })

  const metadataKeys = ['_createdAt', '_updatedAt', '_versionNumber', '_versionId'] as const

  it('gets a dance by id without authentication', async () => {
    const service = app.service('dances')
    const dance = await service.get(testDances[0]._id) as Dances

    expect(omit(metadataKeys, dance), 'Gets correct dance').to.deep.equal(testDances[0])
  })

  describe('find', () => {
    it('finds all initial test dances without authentication', async () => {
      const service = app.service('dances')

      const dances = await service.find({})
      expect(dances.map(omit(metadataKeys)), 'Finds all initial test dances').to.have.deep.members(testDances)
    })

    testUsers.forEach(user => {
      it(`finds all initial test dances with user '${user.name}'`, async () => {
        const service = app.service('dances')

        const dances = await service.find({ user })
        expect(dances.map(omit(metadataKeys)), 'Finds all initial test dances').to.have.deep.members(testDances)
      })
    })
  })

  describe('create and delete', () => {
    it('fails to create a dance without authentication', async () => {
      const service = app.service('dances')
      expect(service.create(danceToCreate)).to.be.rejectedWith('Access denied')
    })

    testUsers.forEach(user => {
      it(`creates and removes a dance with logged in user '${user.name}'`, async () => {
        const service = app.service('dances')

        const keys = Object.keys(danceToCreate) as (keyof DancesData)[]

        // Create
        const created = await service.create(danceToCreate, { user })
        const dances = await service.find({})

        expect(created._id).to.exist
        expect(dances, 'One dance created').to.have.length(testDances.length + 1)
        expect(dances.map(pick(keys)), 'Dance contains correct data').to.deep.include(pick(keys, danceToCreate))

        // Remove
        await service.remove(created._id, { user: adminUser })
        const dancesAfterRemove = await service.find({})
        expect(dancesAfterRemove, 'One dance remoed').to.have.length(testDances.length)
        expect(dancesAfterRemove.map(prop('_id')), 'Removed dance is not in list anymore').to.not.include(created._id)
      })
    })
  })

  describe('delete when in use', () => {
    let dance: Dances
    // The dependency graph registers dependencies asynchronously via event listeners.
    // A short wait ensures those async operations complete before we test deletion.
    const waitForDependencyRegistration = () => new Promise(resolve => setTimeout(resolve, 100))

    beforeEach(async () => {
      dance = await app.service('dances').create(danceToCreate, { user: adminUser }) as Dances
    })

    afterEach(async () => {
      await app.service('dances').remove(dance._id, { user: adminUser }).catch(() => {/* already removed */})
    })

    it('fails to delete a dance used in a workshop', async () => {
      const events = await app.service('events').find({ user: adminUser }) as Events[]
      const workshop = await app.service('workshops').create(
        {
          name: 'Workshop using dance',
          abbreviation: 'WUD',
          description: 'A workshop that references the dance',
          instanceSpecificDances: false,
          eventId: events[0]._id,
          instances: [
            {
              _id: 'inst-1',
              description: 'Instance 1',
              abbreviation: 'I1',
              dateTime: '2026-01-01T10:00:00.000Z',
              durationInMinutes: 60,
              danceIds: [dance._id],
            },
          ],
        } as WorkshopsData,
        { user: adminUser },
      ) as Workshops

      await waitForDependencyRegistration()

      try {
        await expect(
          app.service('dances').remove(dance._id, { user: adminUser }),
        ).to.be.rejectedWith('still in use')
      } finally {
        await app.service('workshops').remove(workshop._id, { user: adminUser })
      }
    })

    it('fails to delete a dance used in an event program', async () => {
      const event = await app.service('events').create(
        {
          name: 'Event using dance',
          beginDate: '2026-06-01',
          endDate: '2026-06-01',
        } as EventsData,
        { user: adminUser },
      ) as Events

      await app.service('events').patch(
        event._id,
        {
          program: {
            dateTime: '2000-01-01T00:00:00',
            introductions: { title: '', titleSlideStyleId: null, program: [] },
            slideStyleId: null,
            pauseBetweenDances: 0,
            defaultIntervalMusic: { name: null, description: null, showInLists: false },
            danceSets: [
              {
                _id: 'ds-1',
                title: 'Dance Set 1',
                titleSlideStyleId: null,
                intervalMusic: null,
                program: [
                  {
                    _id: 'pi-1',
                    slideStyleId: null,
                    type: 'Dance' as const,
                    danceId: dance._id,
                    eventProgram: null,
                  },
                ],
              },
            ],
          },
        } as any,
        { user: adminUser },
      )

      await waitForDependencyRegistration()

      try {
        await expect(
          app.service('dances').remove(dance._id, { user: adminUser }),
        ).to.be.rejectedWith('still in use')
      } finally {
        await app.service('events').remove(event._id, { user: adminUser })
      }
    })
  })

  describe('update and patch', () => {
    it('fails to modify a dance without authentication', async () => {
      const service = app.service('dances')
      const dance = testDances[0]

      expect(service.update(dance._id, { ...dance, name: 'New Name' })).to.be.rejectedWith('Access denied')
      expect(service.patch(dance._id, { name: 'New Name' })).to.be.rejectedWith('Access denied')
      expect(service.remove(dance._id)).to.be.rejectedWith('Access denied')
    })

    testUsers.forEach(user => {
      it(`modifies a dance with logged in user '${user.name}'`, async () => {
        const service = app.service('dances')
        const dance = testDances[0]

        const updatedData = { ...dance, name: 'New Name' }
        const updated = await service.update(dance._id, updatedData, { user }) as Dances
        expect(updated.name, 'Dance name updated').to.equal('New Name')

        const patched = await service.patch(dance._id, { name: 'Another Name' }, { user }) as Dances
        expect(patched.name, 'Dance name patched').to.equal('Another Name')

        // Clean up
        await service.update(dance._id, dance, { user: adminUser })
      })
    })
  })
})
