import { expect } from 'chai'
import { app } from '../../../src/app'

describe('convert service', () => {
  it('registered the service', () => {
    const service = app.service('convert')

    expect(service, 'Registered the service').to.exist
  })
})
