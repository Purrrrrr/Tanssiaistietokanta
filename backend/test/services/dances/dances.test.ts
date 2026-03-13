// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'
import { pick } from 'es-toolkit'
import { DancesData } from './dances.schema'
import { normalUser } from '../../fixtures/test-users'

describe('dances service', () => {
  before(async () => {
    await app.listen(app.get('port'))
  })

  after(async () => {
    await app.teardown()
  })

  it('registered the service', () => {
    const service = app.service('dances')

    assert.ok(service, 'Registered the service')
  })

  it('creates a dance', async () => {
    const service = app.service('dances')

    const dance = {
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
    const keys = Object.keys(dance) as (keyof DancesData)[]
    await service.create(dance, { user: normalUser })

    const dances = await service.find({})
    assert.equal(dances.length, 1, 'One dance created')
    assert.deepEqual(pick(dances[0], keys), pick(dance, keys), 'Dance contains correct data')
  })
})
