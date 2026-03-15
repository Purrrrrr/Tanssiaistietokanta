// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import { expect, use } from 'chai'
import { omit, pick, prop } from 'ramda'
import { app } from '../../../src/app'
import { Dances, DancesData } from './dances.schema'
import { adminUser, enabledTestUsers as testUsers } from '../../fixtures/test-users'
import chaiAsPromised from 'chai-as-promised'
import { testDances } from '../../fixtures/test-dances'

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
