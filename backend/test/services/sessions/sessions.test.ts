import { expect } from 'chai'
import { app } from '../../../src/app'

describe('sessions service', () => {
  it('registered the service', () => {
    const service = app.service('sessions')

    expect(service, 'Registered the service').to.exist
  })
})
