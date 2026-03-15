import { expect } from 'chai'
import { app } from '../../../src/app'

describe('events service', () => {
  it('registered the service', () => {
    const service = app.service('events')

    expect(service, 'Registered the service').to.exist
  })
})
