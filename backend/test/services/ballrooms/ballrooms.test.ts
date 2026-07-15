import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'

import { app, initializeApp } from '../../../src/app'
import type { Ballrooms, BallroomsData } from '../../../src/services/ballrooms/ballrooms.schema'
import { adminUser } from '../../fixtures/test-users'

use(chaiAsPromised)

describe('ballrooms service', () => {
  before(async () => {
    await initializeApp()
  })

  after(async () => {
    await app.teardown()
  })

  it('registered the service', () => {
    const service = app.service('ballrooms')
    expect(service, 'Registered the service').to.exist
  })

  it('returns ballrooms without authentication', async () => {
    const ballrooms = await app.service('ballrooms').find({})
    expect(ballrooms).to.be.an('array')
  })

  it('creates, patches, and removes a ballroom as admin', async () => {
    const created = await app.service('ballrooms').create(
      {
        venueName: 'Test Venue',
        roomName: 'Main Hall',
        map: { width: 640, height: 480, data: { objects: [] } },
      } as BallroomsData,
      { user: adminUser },
    ) as Ballrooms

    expect(created._id).to.exist
    expect(created.venueName).to.equal('Test Venue')
    expect(created.roomName).to.equal('Main Hall')
    expect(created.map).to.deep.equal({ width: 640, height: 480, data: { objects: [] } })

    const patched = await app.service('ballrooms').patch(
      created._id,
      { roomName: 'Updated Hall' },
      { user: adminUser },
    ) as Ballrooms

    expect(patched.roomName).to.equal('Updated Hall')

    await app.service('ballrooms').remove(created._id, { user: adminUser })
  })

  it('rejects duplicate venue and room combinations', async () => {
    const first = await app.service('ballrooms').create(
      {
        venueName: 'Unique Venue',
        roomName: 'Duplicate Room',
        map: {},
      } as BallroomsData,
      { user: adminUser },
    ) as Ballrooms

    try {
      await expect(
        app.service('ballrooms').create(
          {
            venueName: 'Unique Venue',
            roomName: 'Duplicate Room',
            map: {},
          } as BallroomsData,
          { user: adminUser },
        ),
      ).to.be.rejectedWith(/(already exists|violates the unique constraint)/i)
    } finally {
      await app.service('ballrooms').remove(first._id, { user: adminUser })
    }
  })
})
