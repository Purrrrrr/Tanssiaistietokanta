import { expect } from 'chai'
import { app } from '../../../src/app'

describe('channel-connections service', () => {
  it('registered the service', () => {
    const service = app.service('channel-connections')

    expect(service, 'Registered the service').to.exist
  })
})
