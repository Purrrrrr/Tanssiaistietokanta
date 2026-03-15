// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import { expect } from 'chai'
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

    expect(service, 'Registered the service').to.exist
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
    expect(dances, 'One dance created').to.have.length(1)
    expect(pick(dances[0], keys), 'Dance contains correct data').to.deep.equal(pick(dance, keys))
  })
})
