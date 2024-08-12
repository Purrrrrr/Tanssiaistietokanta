import { expect } from 'chai'
import MockDate from 'mockdate'

import VersioningNeDBService, { CREATE_VERSION_AFTER_IDLE_TIME, MAX_VERSION_AGE } from '../../src/utils/VersioningNeDBService'
import type { Versionable } from '../../src/utils/VersioningNeDBService'
import { Params } from '@feathersjs/feathers'

interface Data {
  foo: number
}
interface Record extends Data, Versionable { }

describe('VersioningNeDBService', () => {
  let db : VersioningNeDBService<Record, Data, Params, Partial<Data>>
  
  beforeEach(() => {
    db = new VersioningNeDBService({inMemoryOnly: true})
    MockDate.set(0)
  })

  after(() => {
    MockDate.reset()
  })

  it('Creates a version when creating a record', async () => {
    const created = await db.create({foo: 2})
    const now = new Date().toISOString()
    
    expect(created._id).to.be.a('string')
    expect(created).to.include({
      _createdAt: now,
      _updatedAt: now,
      _versionNumber: 0,
    })
  })

  it('Creates one version when creating a record and almost immediately updating it', async () => {
    const record = await db.create({foo: 5})
    const createTime = new Date().toISOString()

    MockDate.set(1)

    const updated = await db.update(record._id, {foo: 6})
    const now = new Date().toISOString()
    expect(updated).to.include({
      _createdAt: createTime,
      _updatedAt: now,
      _versionNumber: 0,
    })

    const versions = await db.find({
      query: {_id: record._id, searchVersions: true}
    })
    expect(versions).to.have.length(1)
  })
  
  it('Creates a new version when updating a record after timeout', async () => {
    const record = await db.create({foo: 5})
    const createTime = new Date().toISOString()

    MockDate.set(CREATE_VERSION_AFTER_IDLE_TIME + 1)

    const updated = await db.update(record._id, {foo: 6})
    const now = new Date().toISOString()
    expect(updated).to.include({
      _createdAt: createTime,
      _updatedAt: now,
      _versionNumber: 1,
    })

    const versions = await db.find({
      query: {_id: record._id, searchVersions: true}
    })
    expect(versions).to.have.length(2)
  })
  
  it('Creates two new versions when updating a record twice at distinct times', async () => {
    const record = await db.create({foo: 5})
    const createTime = new Date().toISOString()

    MockDate.set(CREATE_VERSION_AFTER_IDLE_TIME + 1)
    await db.update(record._id, {foo: 6})

    MockDate.set(CREATE_VERSION_AFTER_IDLE_TIME * 2 + 2)
    const updated = await db.update(record._id, {foo: 7})

    const now = new Date().toISOString()
    expect(updated).to.include({
      foo: 7,
      _createdAt: createTime,
      _updatedAt: now,
      _versionNumber: 2,
    })

    const versions = await db.find({
      query: {_id: record._id, searchVersions: true}
    })
    expect(versions).to.have.length(3)
  })
  
  it('Creates only one new version when updating a record inside timeout', async () => {
    const record = await db.create({foo: 5})
    const createTime = new Date().toISOString()

    MockDate.set(CREATE_VERSION_AFTER_IDLE_TIME + 1)
    await db.update(record._id, {foo: 6})

    MockDate.set(CREATE_VERSION_AFTER_IDLE_TIME + 100)
    const updated = await db.update(record._id, {foo: 7})

    const now = new Date().toISOString()
    expect(updated).to.include({
      foo: 7,
      _createdAt: createTime,
      _updatedAt: now,
      _versionNumber: 1,
    })

    const versions = await db.find({
      query: {_id: record._id, searchVersions: true}
    })
    expect(versions).to.have.length(2)
  })
  
  it('Always creates a new version after MAX_VERSION_AGE', async () => {
    const record = await db.create({foo: 5})
    const createTime = new Date().toISOString()

    let time = 0
    let updated
    while(time < MAX_VERSION_AGE) {
      time += CREATE_VERSION_AFTER_IDLE_TIME - 1
      MockDate.set(time)
      updated = await db.update(record._id, {foo: time})
    }

    const now = new Date().toISOString()
    expect(updated).to.include({
      foo: time,
      _createdAt: createTime,
      _updatedAt: now,
      _versionNumber: 1,
    })

    const versions = await db.find({
      query: {_id: record._id, searchVersions: true}
    })
    expect(versions).to.have.length(2)
  })

})
