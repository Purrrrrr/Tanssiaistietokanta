import { expect, use } from 'chai'
import { prop } from 'ramda'
import { app } from '../../../src/app'
import type { Volunteers, VolunteersData } from './volunteers.schema'
import { adminUser, normalUser } from '../../fixtures/test-users'
import { canonicalVolunteer, duplicateVolunteer } from '../../fixtures/test-volunteers'
import chaiAsPromised from 'chai-as-promised'
import { SkipAccessControl } from '../../../src/services/access/hooks'

use(chaiAsPromised)

describe('volunteers service', () => {
  before(async () => {
    await app.listen(app.get('port'))
  })

  after(async () => {
    await app.teardown()
  })

  it('registered the service', () => {
    const service = app.service('volunteers')
    expect(service, 'Registered the service').to.exist
  })

  describe('find', () => {
    it('returns volunteers without authentication', async () => {
      const volunteers = await app.service('volunteers').find({})
      const names = volunteers.map(prop('name'))

      expect(names, 'Canonical volunteer is visible').to.include(canonicalVolunteer.name)
    })

    it('excludes volunteers that have duplicatedBy set', async () => {
      const volunteers = await app.service('volunteers').find({})
      const names = volunteers.map(prop('name'))

      expect(names, 'Canonical volunteer is visible').to.include(canonicalVolunteer.name)
      expect(names, 'Duplicate volunteer is hidden').to.not.include(duplicateVolunteer.name)
    })

    it('allows searching by duplicatedBy to find duplicate records', async () => {
      const volunteers = await app.service('volunteers').find({
        query: { duplicatedBy: canonicalVolunteer._id },
      })
      const names = volunteers.map(prop('name'))

      expect(names, 'Duplicate volunteer is found when searching by duplicatedBy').to.include(duplicateVolunteer.name)
    })
  })

  describe('get', () => {
    it('gets a volunteer without authentication', async () => {
      const volunteer = await app.service('volunteers').get(canonicalVolunteer._id) as Volunteers

      expect(volunteer._id).to.equal(canonicalVolunteer._id)
      expect(volunteer.name).to.equal(canonicalVolunteer.name)
    })

    it('follows duplicatedBy chain and returns canonical volunteer', async () => {
      const volunteer = await app.service('volunteers').get(duplicateVolunteer._id) as Volunteers

      expect(volunteer._id, 'Returns canonical volunteer id').to.equal(canonicalVolunteer._id)
      expect(volunteer.name, 'Returns canonical volunteer name').to.equal(canonicalVolunteer.name)
    })

    it('returns the duplicate record itself when fetching a specific version (no redirect)', async () => {
      // Get the actual _versionId from the versions DB
      const versions = await app.service('volunteers').find({
        [SkipAccessControl]: true,
        query: { searchVersions: true, _id: duplicateVolunteer._id },
      })
      const versionId = versions[0]?._versionId

      expect(versionId, 'Version ID should exist').to.be.a('string').that.is.not.empty

      const result = await app.service('volunteers').get(duplicateVolunteer._id, {
        query: { _versionId: versionId },
      })

      expect(result._id, 'Returns the duplicate volunteer itself').to.equal(duplicateVolunteer._id)
    })
  })

  describe('create', () => {
    it('fails to create a volunteer without authentication', async () => {
      expect(
        app.service('volunteers').create({ name: 'Unauthorized Volunteer' } as VolunteersData),
      ).to.be.rejectedWith('Access denied')
    })

    it('creates and removes a volunteer as admin', async () => {
      const created = await app.service('volunteers').create(
        { name: 'Temp Volunteer' } as VolunteersData,
        { user: adminUser },
      ) as Volunteers

      expect(created._id).to.exist
      expect(created.name).to.equal('Temp Volunteer')

      await app.service('volunteers').remove(created._id, { user: adminUser })
    })

    it('creates and removes a volunteer as any authenticated user', async () => {
      const created = await app.service('volunteers').create(
        { name: 'Normal User Volunteer' } as VolunteersData,
        { user: normalUser },
      ) as Volunteers

      expect(created._id).to.exist

      await app.service('volunteers').remove(created._id, { [SkipAccessControl]: true })
    })
  })

  describe('patch', () => {
    it('fails to patch a volunteer without authentication', async () => {
      expect(
        app.service('volunteers').patch(canonicalVolunteer._id, { name: 'Hacked' }),
      ).to.be.rejectedWith('Access denied')
    })

    it('patches a volunteer as admin', async () => {
      const patched = await app.service('volunteers').patch(
        canonicalVolunteer._id, { name: 'Patched Name' }, { user: adminUser },
      ) as Volunteers

      expect(patched.name).to.equal('Patched Name')

      // Restore
      await app.service('volunteers').patch(
        canonicalVolunteer._id, { name: canonicalVolunteer.name }, { user: adminUser },
      )
    })
  })

  describe('remove', () => {
    it('fails to remove a volunteer without authentication', async () => {
      expect(
        app.service('volunteers').remove(canonicalVolunteer._id),
      ).to.be.rejectedWith('Access denied')
    })

    it('removes a volunteer as admin', async () => {
      const temp = await app.service('volunteers').create(
        { name: 'To Be Removed' } as VolunteersData,
        { user: adminUser },
      ) as Volunteers

      await app.service('volunteers').remove(temp._id, { user: adminUser })

      const found = await app.service('volunteers').find({ [SkipAccessControl]: true, query: { _id: temp._id } })
      expect(found, 'Volunteer was removed').to.have.length(0)
    })
  })
})
