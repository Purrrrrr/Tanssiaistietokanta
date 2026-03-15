import { expect } from 'chai'
import { app } from '../../../src/app'

describe('graphql service', () => {
  it('registered the service', () => {
    const service = app.service('graphql')

    expect(service, 'Registered the service').to.exist
  })
})
