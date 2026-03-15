import { expect } from 'chai'
import { app } from '../../../src/app'

describe('access service', () => {
  it('registered the service', () => {
    const service = app.service('access')

    expect(service, 'Registered the service').to.exist
  })
})
