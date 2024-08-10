import type { Id, Params } from '@feathersjs/feathers'
import { Type, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { NeDBService, NeDBServiceOptions } from './NeDBService'
import { Id as IdType } from './common-types'

const versionableQuerySchema = querySyntax(Type.Object({
  _id: Type.Union([IdType(), Type.Number()]),
  _versionId: IdType(),
  _createdAt: Type.String(),
  _updatedAt: Type.String(),
}))
export type VersionSearchQuery = Omit<Static<typeof versionableQuerySchema>, '$select'> & { searchVersions?: boolean, $select?: string[] }

export interface Versionable { 
  _id: Id
  _versionId?: Id
  _versionNumber: number
  _updatedAt: string
  _createdAt: string
}
type VersionOf<R extends Versionable> = Omit<R, '_versionId'> & { _recordId: Id, _versionCreatedAt: string }

export default class VersioningNeDBService<Result extends Versionable, Data, ServiceParams extends Params<VersionSearchQuery>, Patch> extends NeDBService<Result, Data, ServiceParams, Patch> {
  versionService: VersionService<Result>
  versionStoreFunctions = new Map()

  constructor(public params: NeDBServiceOptions) {
    super(params)
    this.versionService = new VersionService(params)
  }

  getVersionModel() {
    return this.versionService.getModel()
  }

  async find(_params?: ServiceParams): Promise<Result[]> {
    if (_params?.query?.searchVersions || _params?.query?._versionId) {
      return await this.versionService.find(_params)
    }
    return this.currentService.find(this.mapParams(_params))
  }

  async getVersion(id: Id, versionId: Id, _params?: ServiceParams): Promise<Result> {
    return await this.versionService.get(versionId, _params)
  }

  async getLatestVersionAtTime(id: Id, maxDate: string): Promise<Result> {
    const current = await this.get(id)

    return current
  }

  protected onSave(result: Result): void {
    this.versionService.saveVersion(result)
  }

  protected async mapData(_existing: Result | null, data: Data) {
    const _updatedAt = now()
    const increment = _existing !== null && await this.versionService.shouldIncrementVersion(_existing._id, _updatedAt)
    return {
      ...data,
      _versionNumber: (_existing?._versionNumber ?? 0) + (+increment),
      _createdAt: _existing?._createdAt ?? now(),
      _updatedAt,
    } as unknown as Result
  }

  protected async mapPatch(_existing: Result, data: Patch) {
    const _updatedAt = now()
    const increment = await this.versionService.shouldIncrementVersion(_existing._id, _updatedAt)
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
const CREATE_VERSION_AFTER_IDLE_TIME = 5 * SECOND;
// If the latest version is older than MAX_VERSION_AGE, always create a new version
const MAX_VERSION_AGE = 5 * 60 * SECOND;

type VersionResult<X> = X & {
  _versionId: Id
  _versionCreatedAt: string
}

class VersionService<Result extends Versionable> extends NeDBService<VersionResult<Result>, Result, Params<VersionSearchQuery>, Result, VersionOf<Result>> {
  private latestVersionCache: Map<Id, VersionResult<Result>>

  constructor(public _params: NeDBServiceOptions) {
    const { dbname, ...params} = _params
    super({ ...params, dbname: `${dbname}-versions`})
    this.getModel().ensureIndex({fieldName: ['_recordId', '_id']})
    this.latestVersionCache = new Map()
  }

  async saveVersion(data: Result): Promise<VersionResult<Result>> {
    const createNew = await this.shouldIncrementVersion(data._id, data._updatedAt)
    
    if (createNew) {
      return this.create(data)
    } else {
      const latestVersion = await this.getLatestVersion(data._id) as VersionResult<Result>
      return this.update(latestVersion._versionId, data) as Promise<VersionResult<Result>>
    }
  }

  async shouldIncrementVersion(id: Id, updatedAt: string): Promise<boolean> {
    const latestVersion = await this.getLatestVersion(id)
    const newTimestamp = +new Date(updatedAt)
    const lastUpdated = +new Date(latestVersion?._updatedAt ?? 0)
    const lastVersionCreatedAt = +new Date(latestVersion?._versionCreatedAt ?? 0)

    console.log({
      latestVersion,
      diff1: newTimestamp - lastUpdated,
      diff2: newTimestamp - lastVersionCreatedAt,
      increment: latestVersion === null
      || newTimestamp > lastUpdated + CREATE_VERSION_AFTER_IDLE_TIME
      || newTimestamp > lastVersionCreatedAt + MAX_VERSION_AGE
    })
    
    return latestVersion === null
      || newTimestamp > lastUpdated + CREATE_VERSION_AFTER_IDLE_TIME
      || newTimestamp > lastVersionCreatedAt + MAX_VERSION_AGE
  }

  protected onSave(result: VersionOf<Result>): void {
    console.log('Save version', result)
    this.latestVersionCache.set(result._recordId, this.mapToResult(result))
  }

  async getLatestVersion(id: Id): Promise<VersionResult<Result> | null> {
    const cached = this.latestVersionCache.get(id)
    if (cached) return cached

    const [result] = await this.find({
      query: {
        $sort: {
          _updatedAt: -1
        },
        $limit: 1,
        _id: id
      },
    })
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
        switch(key) {
          case '_id': return '_recordId'
          case '_versionId': return '_id'
          default: return key
        }
      })
    }

    return { ...params, query: versionQuery }
  }

  protected async mapData<D extends Result>(_existing: VersionOf<Result> | null, data: D) {
    console.log('mapping version', data)
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
      ...rest
    } as unknown as VersionResult<Result>
  }
}

const now = () => new Date().toISOString()
