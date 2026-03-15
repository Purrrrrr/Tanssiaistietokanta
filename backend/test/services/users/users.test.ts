import { expect } from 'chai'
import { app } from '../../../src/app'

describe('users service', () => {
  it('registered the service', () => {
    const service = app.service('users')

    expect(service, 'Registered the service').to.exist
  })
})
