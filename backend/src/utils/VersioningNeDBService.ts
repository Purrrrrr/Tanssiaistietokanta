import type { Id, Params } from '@feathersjs/feathers'
import { NotFound } from '@feathersjs/errors'
import { Type, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { NeDBService, NeDBServiceOptions } from './NeDBService'
import { Id as IdType } from './common-types'
import { getAtDateParam, setAtDateParam } from '../hooks/versioning-params-ctx'

const _versionableQuerySchema = querySyntax(Type.Object({
  _id: Type.Union([IdType(), Type.Number()]),
  _versionId: IdType(),
  _createdAt: Type.String(),
  _updatedAt: Type.String(),
}))
export type VersionSearchQuery = Omit<Static<typeof _versionableQuerySchema>, '$select'> & { searchVersions?: boolean, atDate?: string, $select?: string[] }

export interface Versionable {
  _id: Id
  _versionId?: Id
  _versionNumber: number
  _updatedAt: string
  _createdAt: string
}
type VersionOf<R extends Versionable> = Omit<R, '_versionId'> & {
  _recordId: Id
  _versionCreatedAt: string
  // This appears on the last version to exist of the record if it's deleted
  _recordDeletedAt?: string
}

export default class VersioningNeDBService<Result extends Versionable, Data, ServiceParams extends Params<VersionSearchQuery>, Patch> extends NeDBService<Result, Data, ServiceParams, Patch> {
  versionService: VersionService<Result>
  versionStoreFunctions = new Map()

  constructor(public params: NeDBServiceOptions) {
    super(params)
    this.versionService = new VersionService({
      ...params,
      indexes: params.indexes?.map(index => ({ ...index, unique: false })) ?? [],
    })
  }

  getVersionModel() {
    return this.versionService.getModel()
  }

  async find(_params?: ServiceParams): Promise<Result[]> {
    if (_params?.query?.atDate) {
      return this.findAtDate(_params, _params.query.atDate)
    }
    if (_params?.query) {
      delete _params.query.atDate
    }
    if (_params?.query?.searchVersions || _params?.query?._versionId) {
      return this.mapToResults(await this.versionService.find(_params)) as Result[]
    }
    if (_params?.query) {
      delete _params.query.searchVersions
      delete _params.query._versionId
    }
    const contextAtDate = getAtDateParam()
    if (contextAtDate) {
      return this.findAtDate(_params ?? {} as ServiceParams, contextAtDate)
    }
    return this.mapToResults(await this.currentService.find(this.mapParams(_params))) as Result[]
  }

  protected mapToResult(record: Result): Result {
    if ('_versionId' in record) {
      return record
    }
    return {
      ...record,
      _versionId: null,
    }
  }

  async get(id: Id, _params?: ServiceParams): Promise<Result> {
    if (typeof _params?.query?.atDate === 'string') {
      return this.getAtDate(id, _params.query.atDate)
    }
    if (typeof _params?.query?._versionId === 'string') {
      const version = await this.versionService.get(_params.query._versionId, _params)
      setAtDateParam(version._updatedAt)
      return this.mapToResult(version)
    }
    const contextAtDate = getAtDateParam()
    if (contextAtDate) {
      return this.getAtDate(id, contextAtDate)
    }
    return super.get(id, _params)
  }

  private async getAtDate(id: Id, atDate: string): Promise<Result> {
    setAtDateParam(atDate)
    const versions = await this.versionService.find({
      query: {
        _id: id,
        _updatedAt: { $lte: atDate },
        $sort: { _updatedAt: -1 },
        $limit: 1,
      },
    })
    if (!versions.length) {
      throw new NotFound(`No record ${id} found at or before ${atDate}`)
    }
    const version = versions[0]
    const deletedAt = (version as any)._recordDeletedAt
    if (deletedAt && deletedAt <= atDate) {
      throw new NotFound(`Record ${id} was deleted before ${atDate}`)
    }
    return this.mapToResult(version as unknown as Result)
  }

  private async findAtDate(params: ServiceParams, atDate: string): Promise<Result[]> {
    setAtDateParam(atDate)
    const { atDate: _ignored, searchVersions: _ignored2, ...query } = params.query ?? {}
    const allVersions = await this.versionService.find({
      query: {
        ...query,
        _updatedAt: { $lte: atDate },
        $sort: { _updatedAt: -1 },
      },
    })
    // Pick the latest version per record (sorted desc so first occurrence = latest)
    const seenRecords = new Set<Id>()
    const latestVersions: typeof allVersions = []
    for (const version of allVersions) {
      if (!seenRecords.has(version._id)) {
        seenRecords.add(version._id)
        latestVersions.push(version)
      }
    }
    // Exclude records that were already deleted at atDate
    const activeVersions = latestVersions.filter(v => {
      const deletedAt = (v as any)._recordDeletedAt
      return !deletedAt || deletedAt > atDate
    })
    return this.mapToResults(activeVersions as unknown as Result[]) as Result[]
  }

  async getLatestVersion(id: Id): Promise<Result | null> {
    return this.versionService.getLatestVersion(id)
  }

  protected async onSave(result: Result): Promise<void> {
    await this.versionService.saveVersion(result)
  }

  protected async onRemove(result: Result): Promise<void> {
    await this.versionService.markAsDeleted(result)
  }

  protected async mapData(_existing: Result | null, data: Data) {
    const _updatedAt = now()
    // console.log('determining increment', _existing !== null)
    const increment = _existing !== null
      && await this.versionService.shouldIncrementVersion(_existing._id)
    return {
      ...data,
      _versionNumber: (_existing?._versionNumber ?? 0) + (+increment),
      _createdAt: _existing?._createdAt ?? now(),
      _updatedAt,
    } as unknown as Result
  }

  protected async mapPatch(_existing: Result, data: Patch) {
    const _updatedAt = now()
    const increment = await this.versionService.shouldIncrementVersion(_existing._id)
    return {
      ...data,
      _versionNumber: _existing._versionNumber + (+increment),
      _createdAt: _existing._createdAt,
      _updatedAt,
    } as unknown as Result
  }
}

const SECOND = 1000
// If there are no updates to a version in CREATE_VERSION_AFTER_IDLE_TIME, create a new version on next save
export const CREATE_VERSION_AFTER_IDLE_TIME = 5 * SECOND
// If the latest version is older than MAX_VERSION_AGE, always create a new version
export const MAX_VERSION_AGE = 5 * 60 * SECOND

type VersionResult<X> = X & {
  _versionId: Id
  _versionCreatedAt: string
}

class VersionService<Result extends Versionable> extends NeDBService<VersionResult<Result>, Result, Params<VersionSearchQuery>, { _recordDeletedAt: string }, VersionOf<Result>> {
  private latestVersionCache: Map<Id, VersionResult<Result>>

  constructor(public params: NeDBServiceOptions) {
    super(
      params.inMemoryOnly
        ? { inMemoryOnly: true }
        : { ...params, dbname: `${params.dbname}-versions` },
    )
    this.getModel().ensureIndex({ fieldName: ['_recordId', '_id'] })
    this.latestVersionCache = new Map()
  }

  async saveVersion(data: Result): Promise<VersionResult<Result>> {
    const createNew = await this.shouldIncrementVersion(data._id)

    if (createNew) {
      return this.create(data)
    } else {
      const latestVersion = await this.getLatestVersion(data._id) as VersionResult<Result>
      return this.update(latestVersion._versionId, data) as Promise<VersionResult<Result>>
    }
  }

  async shouldIncrementVersion(id: Id): Promise<boolean> {
    const latestVersion = await this.getLatestVersion(id)
    if (latestVersion === null) {
      return true
    }
    const updatedAt = now()
    const newTimestamp = +new Date(updatedAt)
    const lastUpdated = +new Date(latestVersion?._updatedAt ?? 0)
    const lastVersionCreatedAt = +new Date(latestVersion?._versionCreatedAt ?? 0)

    return newTimestamp > lastUpdated + CREATE_VERSION_AFTER_IDLE_TIME
      || newTimestamp > lastVersionCreatedAt + MAX_VERSION_AGE
  }

  protected onSave(result: VersionOf<Result>): void {
    // console.log('cache latest version', result._versionNumber)
    this.latestVersionCache.set(result._recordId, this.mapToResult(result))
  }

  async markAsDeleted(data: Result): Promise<void> {
    const latest = await this.getLatestVersion(data._id)
    if (!latest) return
    await this.patch(latest._versionId, { _recordDeletedAt: now() })
  }

  async getLatestVersion(id: Id): Promise<VersionResult<Result> | null> {
    // console.log(this.latestVersionCache)
    const cached = this.latestVersionCache.get(id)
    if (cached) return cached

    const [result] = (
      await this.find({
        query: {
          $sort: {
            _updatedAt: -1,
          },
          $limit: 1,
          _id: id,
        },
      })
    )

    if (!result) return null
    this.latestVersionCache.set(id, result)
    return result
  }

  protected mapParams(_params?: Params<VersionSearchQuery>): Params | undefined {
    const params = super.mapParams(_params)
    if (params?.query === undefined) return params

    const {
      _versionId,
      _id,
      $select,
      searchVersions: _ignored,
      ...query
    } = params.query

    const versionQuery = query
    if (_versionId) versionQuery._id = _versionId
    if (_id) versionQuery._recordId = _id
    if ($select) {
      versionQuery.$select = $select.map?.((key: string) => {
        switch (key) {
          case '_id': return '_recordId'
          case '_versionId': return '_id'
          default: return key
        }
      })
    }

    return { ...params, query: versionQuery }
  }

  protected async mapData<D extends Result>(_existing: VersionOf<Result> | null, data: D) {
    const { _id, ...rest } = data
    return {
      ...rest,
      _recordId: _id,
      _versionCreatedAt: _existing?._versionCreatedAt ?? now(),
    } as unknown as VersionOf<Result>
  }

  protected mapToResult(record: VersionOf<Result>): VersionResult<Result> {
    const { _id, _recordId, ...rest } = record
    return {
      _id: _recordId,
      _versionId: _id,
      ...rest,
    } as unknown as VersionResult<Result>
  }
}

const now = () => new Date().toISOString()
