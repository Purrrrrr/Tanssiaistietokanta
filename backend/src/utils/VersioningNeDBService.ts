import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import { Type, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import type { Application } from '../declarations'

import * as L from 'partial.lenses'
import createNedbService from 'feathers-nedb'
import NeDB from '@seald-io/nedb'
import {debounce, omitBy, isUndefined} from 'lodash'
import path from 'path'
import computeIfAbsent from './computeIfAbsent'
import { Id as IdType } from './common-types'

const VERSION_SAVE_DELAY_MS = 5000
const MAX_VERSION_SAVE_DELAY_MS = 60000

export interface NeDBServiceOptions {
  app: Application
  dbname: string
  indexes?: NeDB.EnsureIndexOptions[]
}

const versionableQuerySchema = querySyntax(Type.Object({
  _id: IdType(),
  _versionId: IdType(),
  _updatedAt: Type.String(),
}))
export type VersionSearchQuery = Omit<Static<typeof versionableQuerySchema>, '$select'> & { searchVersions?: boolean }

export default class VersioningNeDBService<Result extends {_id: Id, _versionId?: Id }, Data, ServiceParams extends Params<VersionSearchQuery>, Patch> implements ServiceInterface<Result, Data, ServiceParams, Patch> {
  currentService: any
  versionService: any
  versionStoreFunctions = new Map()

  constructor(public params: NeDBServiceOptions) {
    const Model = VersioningNeDBService.createNedb(params, params.dbname)
    const VersionModel = VersioningNeDBService.createNedb(params, params.dbname+'-versions')
    VersionModel.ensureIndex({fieldName: ['_recordId', '_id']})

    this.currentService = createNedbService({Model})
    this.versionService = createNedbService({Model: VersionModel})
  }

  static createNedb(params: NeDBServiceOptions, dbName: string) {
    const dbPath = params.app.get('nedb')
    const neDB = new NeDB({
      filename: path.resolve(dbPath, dbName+'.db'),
      autoload: true,
    })
    params.indexes?.forEach(index => neDB.ensureIndex(index))
    return neDB
  }

  getModel() {
    return this.currentService.getModel()
  }
  getVersionModel() {
    return this.versionService.getModel()
  }

  async find(_params?: ServiceParams): Promise<Result[]> {
    if (_params?.query?.searchVersions || _params?.query?._versionId) {
      const {
        _versionId,
        _id,
        searchVersions: _ignored,
        ...query
      } = _params.query

      const versionParams = {
        ..._params,
        query: omitBy({
          _recordId: _id,
          _id: _versionId,
          ...query,
        }, isUndefined),
      }

      const results = await this.versionService.find(this.fixParams(versionParams)) as Array<Result & { _recordId: Id}>
      return results.map(({_id, _recordId, ...rest}) => ({
        _id: _recordId,
        _versionId: _id,
        ...rest,
      })) as unknown as Result[]
    }
    return this.currentService.find(this.fixParams(_params))
  }

  async get(id: Id, _params?: ServiceParams): Promise<Result> {
    return this.currentService.get(id, this.fixParams(_params))
  }

  async create(data: Data, params?: ServiceParams): Promise<Result>
  async create(data: Data[], params?: ServiceParams): Promise<Result[]>
  async create(data: Data | Data[], params?: ServiceParams): Promise<Result | Result[]> {
    const p = this.fixParams(params)
    const res = await this.currentService.create(this.addTimestamps(data, now()), p)

    return this.queueVersionSave(res, p)
  }

  async update(id: NullableId, data: Data, _params?: ServiceParams): Promise<Result | Result[]> {
    const p = this.fixParams(_params)
    const res = await this.currentService.update(id, this.addTimestamps(data), p)

    return this.queueVersionSave(res, p)
  }

  async patch(id: NullableId, data: Patch, _params?: ServiceParams): Promise<Result | Result[]> {
    const p = this.fixParams(_params)
    const res = await this.currentService.patch(id, this.addTimestamps(data), p)

    return this.queueVersionSave(res, p)
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<Result | Result[]> {
    return this.currentService.remove(id, this.fixParams(_params))
  }

  private fixParams(_params?: ServiceParams): ServiceParams | undefined {
    if (_params?.query !== undefined && '$select' in _params?.query) {
      if (_params.query.$select === undefined) delete _params.query.$select
    }
    return _params
  }

  private async queueVersionSave(res: Result, params?: ServiceParams) {
    runForAll(res, ({_id, ...record}) => {
      this.getDebouncedSaveVersion(_id)({...record, _recordId: _id})
    })
    return res
  }

  private getDebouncedSaveVersion(id: Id) {
    return computeIfAbsent(this.versionStoreFunctions, id, () =>
      debounce((data: Data) => {
        this.versionStoreFunctions.delete(id)
        this.versionService.create(data)
      }, VERSION_SAVE_DELAY_MS, {maxWait: MAX_VERSION_SAVE_DELAY_MS})
    )
  }

  private addTimestamps(data: Data | Data[] | Patch, _createdAt?: string) {
    return map(data, item => ({
      ...item,
      ...(_createdAt ? {_createdAt} : {}),
      _updatedAt: now()
    }))
  }

}

function map<T, R>(data: T | T[], func: (t: T) => R): R | R[] {
  return Array.isArray(data)
    ? data.map(func)
    : func(data)
}

function runForAll<T>(data: T | T[], func: (t: T) => unknown) {
  return Array.isArray(data)
    ? data.forEach(func)
    : func(data)
}

const now = () => new Date().toISOString()
