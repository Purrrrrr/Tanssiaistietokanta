import { expect, use } from 'chai'
import { prop } from 'ramda'
import { app } from '../../../src/app'
import type { File as FileRecord, FileData } from './files.schema'
import type { Events, EventsData } from '../../../src/services/events/events.schema'
import type { Dances, DancesData } from '../../../src/services/dances/dances.schema'
import { adminUser, normalUser, teacherUser } from '../../fixtures/test-users'
import { publicTestEvent, limitedTestEvent } from '../../fixtures/test-events'
import { testDances } from '../../fixtures/test-dances'
import { danceFileFixture, publicEventFileFixture, limitedEventFileFixture, createTestUpload } from '../../fixtures/test-files'
import chaiAsPromised from 'chai-as-promised'
import { loadDependencyTypes } from '../../../src/internal-services/dependencyRelations'

use(chaiAsPromised)

describe('files service', () => {
  before(async () => {
    await app.listen(app.get('port'))
  })

  after(async () => {
    await app.teardown()
  })

  it('registered the service', () => {
    const service = app.service('files')

    expect(service, 'Registered the service').to.exist
  })

  // ─── Dance-owned files ──────────────────────────────────────────────────────
  // Dance access: read (get) is public, but list (find) requires file-access or admins group.
  // Write requires file-access or admins group + any authenticated user.

  describe('dance-owned files', () => {
    describe('find', () => {
      it('fails to find dance files without authentication (find requires file-access group)', async () => {
        expect(
          app.service('files').find({ query: { owner: 'dances', owningId: testDances[0]._id } }),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to find dance files as teacherUser (no file-access group)', async () => {
        expect(
          app.service('files').find({ query: { owner: 'dances', owningId: testDances[0]._id }, user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('returns dance files as normalUser (file-access group)', async () => {
        const files = await app.service('files').find({ query: { owner: 'dances', owningId: testDances[0]._id }, user: normalUser })
        const names = files.map(prop('name'))

        expect(names, 'Dance file is visible to normalUser').to.include(danceFileFixture.name)
      })

      it('returns dance files as admin', async () => {
        const files = await app.service('files').find({ query: { owner: 'dances', owningId: testDances[0]._id }, user: adminUser })
        const names = files.map(prop('name'))

        expect(names, 'Dance file is visible to admin').to.include(danceFileFixture.name)
      })
    })

    describe('get', () => {
      it('gets dance file without authentication', async () => {
        const file = await app.service('files').get(danceFileFixture._id) as FileRecord

        expect(file._id).to.equal(danceFileFixture._id)
        expect(file.name).to.equal(danceFileFixture.name)
        expect(file.owner).to.equal('dances')
      })

      it('gets dance file as normalUser', async () => {
        const file = await app.service('files').get(danceFileFixture._id, { user: normalUser }) as FileRecord

        expect(file._id).to.equal(danceFileFixture._id)
      })
    })

    describe('create', () => {
      it('fails to create a dance file without authentication', async () => {
        expect(
          app.service('files').create({
            owner: 'dances',
            owningId: testDances[0]._id,
            path: '',
            upload: createTestUpload('denied.txt'),
          } as unknown as FileData),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to create a dance file without file-access group (teacherUser)', async () => {
        expect(
          app.service('files').create({
            owner: 'dances',
            owningId: testDances[0]._id,
            path: '',
            upload: createTestUpload('denied.txt'),
          } as unknown as FileData, { user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('creates and removes a dance file as normalUser (file-access group)', async () => {
        const created = await app.service('files').create({
          owner: 'dances',
          owningId: testDances[0]._id,
          path: '',
          upload: createTestUpload('new-dance-file.txt'),
        } as unknown as FileData, { user: normalUser }) as FileRecord

        expect(created._id).to.exist
        expect(created.name).to.equal('new-dance-file.txt')
        expect(created.owner).to.equal('dances')

        await app.service('files').remove(created._id, { user: adminUser })
      })

      it('creates and removes a dance file as admin', async () => {
        const created = await app.service('files').create({
          owner: 'dances',
          owningId: testDances[0]._id,
          path: '',
          upload: createTestUpload('admin-dance-file.txt'),
        } as unknown as FileData, { user: adminUser }) as FileRecord

        expect(created._id).to.exist

        await app.service('files').remove(created._id, { user: adminUser })
      })
    })

    describe('patch', () => {
      it('fails to patch a dance file without authentication', async () => {
        expect(
          app.service('files').patch(danceFileFixture._id, { notes: 'Hacked' }),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to patch a dance file without file-access group (teacherUser)', async () => {
        expect(
          app.service('files').patch(danceFileFixture._id, { notes: 'Hacked' }, { user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('patches a dance file as normalUser (file-access group)', async () => {
        const patched = await app.service('files').patch(
          danceFileFixture._id, { notes: 'Patched notes' }, { user: normalUser },
        ) as FileRecord

        expect(patched.notes).to.equal('Patched notes')

        // Restore
        await app.service('files').patch(danceFileFixture._id, { notes: '' }, { user: adminUser })
      })

      it('patches a dance file as admin', async () => {
        const patched = await app.service('files').patch(
          danceFileFixture._id, { notes: 'Admin patched' }, { user: adminUser },
        ) as FileRecord

        expect(patched.notes).to.equal('Admin patched')

        // Restore
        await app.service('files').patch(danceFileFixture._id, { notes: '' }, { user: adminUser })
      })
    })

    describe('remove', () => {
      it('fails to remove a dance file without authentication', async () => {
        expect(
          app.service('files').remove(danceFileFixture._id),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to remove a dance file without file-access group (teacherUser)', async () => {
        expect(
          app.service('files').remove(danceFileFixture._id, { user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('removes a dance file as normalUser and verifies removal', async () => {
        const temp = await app.service('files').create({
          owner: 'dances',
          owningId: testDances[0]._id,
          path: '',
          upload: createTestUpload('temp-dance-file.txt'),
        } as unknown as FileData, { user: adminUser }) as FileRecord

        await app.service('files').remove(temp._id, { user: normalUser })

        const files = await app.service('files').find({ query: { owner: 'dances', owningId: testDances[0]._id }, user: adminUser })
        expect(files.map(prop('_id')), 'File was removed').to.not.include(temp._id)
      })

      it('removes a dance file as admin and verifies removal', async () => {
        const temp = await app.service('files').create({
          owner: 'dances',
          owningId: testDances[0]._id,
          path: '',
          upload: createTestUpload('temp-dance-file-admin.txt'),
        } as unknown as FileData, { user: adminUser }) as FileRecord

        await app.service('files').remove(temp._id, { user: adminUser })

        const files = await app.service('files').find({ query: { owner: 'dances', owningId: testDances[0]._id }, user: adminUser })
        expect(files.map(prop('_id')), 'File was removed').to.not.include(temp._id)
      })
    })
  })

  // ─── Event-owned files (public event) ───────────────────────────────────────
  // Public event: get is public (no auth needed), but find requires file-access group.
  // Write requires file-access + event role (normalUser has no role on publicTestEvent → only admin can write).

  describe('event-owned files (public event)', () => {
    describe('find', () => {
      it('fails to find public event files without authentication (find requires file-access group)', async () => {
        expect(
          app.service('files').find({ query: { owner: 'events', owningId: publicTestEvent._id } }),
        ).to.be.rejectedWith('Access denied')
      })

      it('returns public event files as normalUser (file-access group, event is public)', async () => {
        const files = await app.service('files').find({ query: { owner: 'events', owningId: publicTestEvent._id }, user: normalUser })
        const names = files.map(prop('name'))

        expect(names, 'Public event file is visible to normalUser').to.include(publicEventFileFixture.name)
      })

      it('returns public event files as admin', async () => {
        const files = await app.service('files').find({ query: { owner: 'events', owningId: publicTestEvent._id }, user: adminUser })
        const names = files.map(prop('name'))

        expect(names, 'Public event file is visible to admin').to.include(publicEventFileFixture.name)
      })
    })

    describe('get', () => {
      it('gets public event file without authentication', async () => {
        const file = await app.service('files').get(publicEventFileFixture._id) as FileRecord

        expect(file._id).to.equal(publicEventFileFixture._id)
        expect(file.name).to.equal(publicEventFileFixture.name)
        expect(file.owner).to.equal('events')
        expect(file.owningId).to.equal(publicTestEvent._id)
      })
    })

    describe('create', () => {
      it('fails to create a public event file without authentication', async () => {
        expect(
          app.service('files').create({
            owner: 'events',
            owningId: publicTestEvent._id,
            path: '',
            upload: createTestUpload('denied.txt'),
          } as unknown as FileData),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to create a public event file without file-access group (teacherUser)', async () => {
        expect(
          app.service('files').create({
            owner: 'events',
            owningId: publicTestEvent._id,
            path: '',
            upload: createTestUpload('denied.txt'),
          } as unknown as FileData, { user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to create a public event file as normalUser (no event role on public event)', async () => {
        // normalUser has file-access group but no organizer/teacher role on the public event
        expect(
          app.service('files').create({
            owner: 'events',
            owningId: publicTestEvent._id,
            path: '',
            upload: createTestUpload('denied.txt'),
          } as unknown as FileData, { user: normalUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('creates and removes a public event file as admin', async () => {
        const created = await app.service('files').create({
          owner: 'events',
          owningId: publicTestEvent._id,
          path: '',
          upload: createTestUpload('admin-public-event-file.txt'),
        } as unknown as FileData, { user: adminUser }) as FileRecord

        expect(created._id).to.exist
        expect(created.owner).to.equal('events')
        expect(created.owningId).to.equal(publicTestEvent._id)

        await app.service('files').remove(created._id, { user: adminUser })
      })
    })
  })

  // ─── Event-owned files (limited event) ──────────────────────────────────────
  // Limited event: get requires event access (organizer/teacher), find requires file-access group.
  // Write requires file-access + event role.
  // normalUser: organizer + file-access → can find, read and write
  // teacherUser: teacher (no file-access) → can read (get) only; find and write are denied
  // adminUser: full access

  describe('event-owned files (limited event)', () => {
    describe('find', () => {
      it('fails to find limited event files without authentication (find requires file-access group)', async () => {
        expect(
          app.service('files').find({ query: { owner: 'events', owningId: limitedTestEvent._id } }),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to find limited event files as teacherUser (no file-access group, even with teacher role)', async () => {
        expect(
          app.service('files').find({ query: { owner: 'events', owningId: limitedTestEvent._id }, user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('returns limited event files as organizer with file-access (normalUser)', async () => {
        const files = await app.service('files').find({ query: { owner: 'events', owningId: limitedTestEvent._id }, user: normalUser })
        const names = files.map(prop('name'))

        expect(names, 'Limited event file is visible to organizer').to.include(limitedEventFileFixture.name)
      })

      it('returns limited event files as admin', async () => {
        const files = await app.service('files').find({ query: { owner: 'events', owningId: limitedTestEvent._id }, user: adminUser })
        const names = files.map(prop('name'))

        expect(names, 'Limited event file is visible to admin').to.include(limitedEventFileFixture.name)
      })
    })

    describe('get', () => {
      it('fails to get a limited event file without authentication', async () => {
        expect(
          app.service('files').get(limitedEventFileFixture._id),
        ).to.be.rejectedWith('Access denied')
      })

      it('gets limited event file as organizer (normalUser)', async () => {
        const file = await app.service('files').get(limitedEventFileFixture._id, { user: normalUser }) as FileRecord

        expect(file._id).to.equal(limitedEventFileFixture._id)
        expect(file.name).to.equal(limitedEventFileFixture.name)
      })

      it('gets limited event file as teacher (teacherUser)', async () => {
        const file = await app.service('files').get(limitedEventFileFixture._id, { user: teacherUser }) as FileRecord

        expect(file._id).to.equal(limitedEventFileFixture._id)
        expect(file.name).to.equal(limitedEventFileFixture.name)
      })

      it('gets limited event file as admin', async () => {
        const file = await app.service('files').get(limitedEventFileFixture._id, { user: adminUser }) as FileRecord

        expect(file._id).to.equal(limitedEventFileFixture._id)
      })
    })

    describe('create', () => {
      it('fails to create a limited event file without authentication', async () => {
        expect(
          app.service('files').create({
            owner: 'events',
            owningId: limitedTestEvent._id,
            path: '',
            upload: createTestUpload('denied.txt'),
          } as unknown as FileData),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to create a limited event file without file-access group (teacherUser)', async () => {
        // teacherUser has teacher role on limited event but lacks file-access group
        expect(
          app.service('files').create({
            owner: 'events',
            owningId: limitedTestEvent._id,
            path: '',
            upload: createTestUpload('denied.txt'),
          } as unknown as FileData, { user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('creates and removes a limited event file as organizer with file-access (normalUser)', async () => {
        const created = await app.service('files').create({
          owner: 'events',
          owningId: limitedTestEvent._id,
          path: '',
          upload: createTestUpload('organizer-limited-event-file.txt'),
        } as unknown as FileData, { user: normalUser }) as FileRecord

        expect(created._id).to.exist
        expect(created.owner).to.equal('events')
        expect(created.owningId).to.equal(limitedTestEvent._id)

        await app.service('files').remove(created._id, { user: adminUser })
      })

      it('creates and removes a limited event file as admin', async () => {
        const created = await app.service('files').create({
          owner: 'events',
          owningId: limitedTestEvent._id,
          path: '',
          upload: createTestUpload('admin-limited-event-file.txt'),
        } as unknown as FileData, { user: adminUser }) as FileRecord

        expect(created._id).to.exist

        await app.service('files').remove(created._id, { user: adminUser })
      })
    })

    describe('patch', () => {
      it('fails to patch a limited event file without authentication', async () => {
        expect(
          app.service('files').patch(limitedEventFileFixture._id, { notes: 'Hacked' }),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to patch a limited event file without file-access group (teacherUser)', async () => {
        expect(
          app.service('files').patch(limitedEventFileFixture._id, { notes: 'Hacked' }, { user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('patches a limited event file as organizer (normalUser)', async () => {
        const patched = await app.service('files').patch(
          limitedEventFileFixture._id, { notes: 'Organizer patched' }, { user: normalUser },
        ) as FileRecord

        expect(patched.notes).to.equal('Organizer patched')

        // Restore
        await app.service('files').patch(limitedEventFileFixture._id, { notes: '' }, { user: adminUser })
      })

      it('patches a limited event file as admin', async () => {
        const patched = await app.service('files').patch(
          limitedEventFileFixture._id, { notes: 'Admin patched' }, { user: adminUser },
        ) as FileRecord

        expect(patched.notes).to.equal('Admin patched')

        // Restore
        await app.service('files').patch(limitedEventFileFixture._id, { notes: '' }, { user: adminUser })
      })
    })

    describe('remove', () => {
      it('fails to remove a limited event file without authentication', async () => {
        expect(
          app.service('files').remove(limitedEventFileFixture._id),
        ).to.be.rejectedWith('Access denied')
      })

      it('fails to remove a limited event file without file-access group (teacherUser)', async () => {
        expect(
          app.service('files').remove(limitedEventFileFixture._id, { user: teacherUser }),
        ).to.be.rejectedWith('Access denied')
      })

      it('removes a limited event file as organizer (normalUser)', async () => {
        const temp = await app.service('files').create({
          owner: 'events',
          owningId: limitedTestEvent._id,
          path: '',
          upload: createTestUpload('temp-limited-event-file.txt'),
        } as unknown as FileData, { user: adminUser }) as FileRecord

        await app.service('files').remove(temp._id, { user: normalUser })

        const files = await app.service('files').find({ query: { owner: 'events', owningId: limitedTestEvent._id }, user: adminUser })
        expect(files.map(prop('_id')), 'File was removed').to.not.include(temp._id)
      })

      it('removes a limited event file as admin', async () => {
        const temp = await app.service('files').create({
          owner: 'events',
          owningId: limitedTestEvent._id,
          path: '',
          upload: createTestUpload('temp-limited-event-admin.txt'),
        } as unknown as FileData, { user: adminUser }) as FileRecord

        await app.service('files').remove(temp._id, { user: adminUser })

        const files = await app.service('files').find({ query: { owner: 'events', owningId: limitedTestEvent._id }, user: adminUser })
        expect(files.map(prop('_id')), 'File was removed').to.not.include(temp._id)
      })
    })
  })

  // ─── File name uniqueness ────────────────────────────────────────────────────
  // Unique index on [root, path, name]: no two files with the same name in the same owner/path

  describe('file name uniqueness', () => {
    const uniquenessBase = {
      owner: 'dances' as const,
      owningId: '',
      path: 'uniqueness-tests',
    }

    before(() => {
      uniquenessBase.owningId = testDances[0]._id
    })

    it('fails to create a file with a duplicate name in the same path', async () => {
      const first = await app.service('files').create({
        ...uniquenessBase,
        upload: createTestUpload('unique-test.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      await expect(
        app.service('files').create({
          ...uniquenessBase,
          upload: createTestUpload('unique-test.txt'),
        } as unknown as FileData, { user: adminUser }),
      ).to.be.rejectedWith('already exists')
      await app.service('files').remove(first._id, { user: adminUser })
    })

    it('allows creating a file with the same name in a different path', async () => {
      const first = await app.service('files').create({
        ...uniquenessBase,
        path: 'path-a',
        upload: createTestUpload('same-name.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      const second = await app.service('files').create({
        ...uniquenessBase,
        path: 'path-b',
        upload: createTestUpload('same-name.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      expect(second._id).to.exist
      expect(second.name).to.equal('same-name.txt')

      await Promise.all([
        app.service('files').remove(first._id, { user: adminUser }),
        app.service('files').remove(second._id, { user: adminUser }),
      ])
    })

    it('allows creating a file with the same name for a different owningId', async () => {
      const first = await app.service('files').create({
        ...uniquenessBase,
        upload: createTestUpload('shared-name.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      const second = await app.service('files').create({
        ...uniquenessBase,
        owningId: testDances[1]._id,
        upload: createTestUpload('shared-name.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      expect(second._id).to.exist
      expect(second.name).to.equal('shared-name.txt')

      await Promise.all([
        app.service('files').remove(first._id, { user: adminUser }),
        app.service('files').remove(second._id, { user: adminUser }),
      ])
    })

    it('auto-renames a file when autoRename=true and name conflicts', async () => {
      const first = await app.service('files').create({
        ...uniquenessBase,
        upload: createTestUpload('auto.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      const second = await app.service('files').create({
        ...uniquenessBase,
        upload: createTestUpload('auto.txt'),
        autoRename: true,
      } as unknown as FileData, { user: adminUser }) as FileRecord

      expect(second._id).to.exist
      expect(second.name).to.equal('auto (2).txt')

      await Promise.all([
        app.service('files').remove(first._id, { user: adminUser }),
        app.service('files').remove(second._id, { user: adminUser }),
      ])
    })

    it('fails to patch a file name to one that already exists in the same path', async () => {
      const first = await app.service('files').create({
        ...uniquenessBase,
        upload: createTestUpload('patch-conflict-a.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      const second = await app.service('files').create({
        ...uniquenessBase,
        upload: createTestUpload('patch-conflict-b.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      await expect(
        app.service('files').patch(second._id, { name: 'patch-conflict-a.txt' }, { user: adminUser }),
      ).to.be.rejectedWith('already exists')
      await Promise.all([
        app.service('files').remove(first._id, { user: adminUser }),
        app.service('files').remove(second._id, { user: adminUser }),
      ])
    })

    it('allows patching a file to its own existing name (no-op rename)', async () => {
      const file = await app.service('files').create({
        ...uniquenessBase,
        upload: createTestUpload('self-rename.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      const patched = await app.service('files').patch(
        file._id, { name: 'self-rename.txt' }, { user: adminUser },
      ) as FileRecord

      expect(patched.name).to.equal('self-rename.txt')

      await app.service('files').remove(file._id, { user: adminUser })
    })
  })

  // ─── Entity dependencies ────────────────────────────────────────────────────

  describe('entity dependencies', () => {
    const deps = loadDependencyTypes('files')
    const childOfDeps = deps.filter(d => d.type === 'childOf')

    it('defines childOf relations for events, workshops and dances', () => {
      const services = childOfDeps.map(d => d.service).sort()
      expect(services).to.deep.equal(['dances', 'events', 'workshops'])
    })

    it('marks all childOf relations with skipVersionUpdate: true', () => {
      expect(childOfDeps.every(d => d.skipVersionUpdate === true)).to.equal(true)
    })

    for (const ownerService of ['events', 'workshops', 'dances'] as const) {
      describe(`${ownerService} childOf relation`, () => {
        const dep = childOfDeps.find(d => d.service === ownerService)!

        it('resolves owningId when owner matches', async () => {
          const ids = await dep.getLinkedIds({ owner: ownerService, owningId: 'abc123' })
          expect(ids).to.deep.equal(['abc123'])
        })

        it('resolves nothing when owner does not match', async () => {
          const otherOwner = ownerService === 'events' ? 'dances' : 'events'
          const ids = await dep.getLinkedIds({ owner: otherOwner, owningId: 'abc123' })
          expect(ids).to.deep.equal([])
        })
      })
    }
  })

  // ─── Parent version isolation ───────────────────────────────────────────────
  // Creating/patching/removing a file must NOT update the parent entity's
  // _updatedAt or _versionNumber (skipVersionUpdate: true on all childOf deps).

  describe('parent version isolation', () => {
    it('does not change event _updatedAt when a file is created', async () => {
      const eventBefore = await app.service('events').get(limitedTestEvent._id, { user: adminUser })

      const file = await app.service('files').create({
        owner: 'events',
        owningId: limitedTestEvent._id,
        path: '',
        upload: createTestUpload('version-isolation-create.txt'),
      } as unknown as FileData, { user: normalUser }) as FileRecord

      const eventAfter = await app.service('events').get(limitedTestEvent._id, { user: adminUser })

      expect(eventAfter._updatedAt, 'event _updatedAt unchanged after file create').to.equal(eventBefore._updatedAt)
      expect(eventAfter._versionNumber, 'event _versionNumber unchanged after file create').to.equal(eventBefore._versionNumber)

      await app.service('files').remove(file._id, { user: adminUser })
    })

    it('does not change event _updatedAt when a file is patched', async () => {
      const eventBefore = await app.service('events').get(limitedTestEvent._id, { user: adminUser })

      await app.service('files').patch(limitedEventFileFixture._id, { notes: 'version test' }, { user: normalUser })

      const eventAfter = await app.service('events').get(limitedTestEvent._id, { user: adminUser })

      expect(eventAfter._updatedAt, 'event _updatedAt unchanged after file patch').to.equal(eventBefore._updatedAt)
      expect(eventAfter._versionNumber, 'event _versionNumber unchanged after file patch').to.equal(eventBefore._versionNumber)

      // Restore
      await app.service('files').patch(limitedEventFileFixture._id, { notes: '' }, { user: adminUser })
    })

    it('does not change event _updatedAt when a file is removed', async () => {
      const file = await app.service('files').create({
        owner: 'events',
        owningId: limitedTestEvent._id,
        path: '',
        upload: createTestUpload('version-isolation-remove.txt'),
      } as unknown as FileData, { user: normalUser }) as FileRecord

      const eventBefore = await app.service('events').get(limitedTestEvent._id, { user: adminUser })

      await app.service('files').remove(file._id, { user: normalUser })

      const eventAfter = await app.service('events').get(limitedTestEvent._id, { user: adminUser })

      expect(eventAfter._updatedAt, 'event _updatedAt unchanged after file remove').to.equal(eventBefore._updatedAt)
      expect(eventAfter._versionNumber, 'event _versionNumber unchanged after file remove').to.equal(eventBefore._versionNumber)
    })
  })

  // ─── Cascade deletion ───────────────────────────────────────────────────────
  // Deleting a parent entity (event, dance, etc.) must cascade-delete its files
  // via the deleteOrphans hook + in-memory dependency graph.

  describe('cascade deletion', () => {
    it('deletes files when their owner event is deleted', async () => {
      const event = await app.service('events').create({
        name: 'Cascade Deletion Test Ball',
        beginDate: '2030-01-01',
        endDate: '2030-01-01',
      } as EventsData, { user: adminUser }) as Events

      const file = await app.service('files').create({
        owner: 'events',
        owningId: event._id,
        path: '',
        upload: createTestUpload('cascade-event-file.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      await app.service('events').remove(event._id, { user: adminUser })

      await expect(
        app.service('files').get(file._id),
      ).to.be.rejectedWith('No record found')
    })

    it('deletes files when their owner dance is deleted', async () => {
      const dance = await app.service('dances').create({
        name: 'Cascade Deletion Test Dance',
        description: '',
        duration: 0,
        prelude: '',
        formation: '',
        source: '',
        category: '',
        instructions: '',
      } as DancesData, { user: adminUser }) as Dances

      const file = await app.service('files').create({
        owner: 'dances',
        owningId: dance._id,
        path: '',
        upload: createTestUpload('cascade-dance-file.txt'),
      } as unknown as FileData, { user: adminUser }) as FileRecord

      await app.service('dances').remove(dance._id, { user: adminUser })

      await expect(
        app.service('files').get(file._id),
      ).to.be.rejectedWith('No record found')
    })
  })
})
