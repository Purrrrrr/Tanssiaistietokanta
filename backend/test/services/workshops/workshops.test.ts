import { expect } from 'chai'
import { app } from '../../../src/app'

describe('workshops service', () => {
  it('registered the service', () => {
    const service = app.service('workshops')

    expect(service, 'Registered the service').to.exist
  })
})
