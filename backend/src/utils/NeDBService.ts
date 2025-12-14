import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import type { Application } from '../declarations'

import createNedbService from 'feathers-nedb'
import NeDB from '@seald-io/nedb'
import path from 'path'
import { map, mapAsync } from './map'

export type NeDBServiceOptions = {
  inMemoryOnly?: false
  app: Application
  id?: string
  dbname: string
  indexes?: NeDB.EnsureIndexOptions[]
} | {
  inMemoryOnly: true
  indexes?: NeDB.EnsureIndexOptions[]
}

interface BaseRecord {
  _id: Id
}

export class NeDBService<Result extends BaseRecord, Data, ServiceParams extends Params<{}>, Patch = Data, Record extends BaseRecord = Result> implements ServiceInterface<Result, Data, ServiceParams, Patch> {
  currentService: any

  constructor(public params: NeDBServiceOptions) {
    const Model = NeDBService.createNedb(params)
    this.currentService = createNedbService({Model})
  }

  static createNedb(params: NeDBServiceOptions) {
    const neDB = new NeDB(
      params?.inMemoryOnly
        ? {
          inMemoryOnly: true,
        } : {
          filename: path.resolve(
            params.app.get('nedb'),
            params.dbname+'.db'
          ),
          autoload: true,
        }
    )
    params.indexes?.forEach(index => neDB.ensureIndex(index))
    return neDB
  }

  getModel(): NeDB {
    return this.currentService.getModel()
  }

  async find(_params?: ServiceParams): Promise<Result[]> {
    return this.mapToResults(await this.currentService.find(this.mapParams(_params))) as Result[]
  }

  async get(id: Id, _params?: ServiceParams): Promise<Result> {
    return this.mapToResult(await this.currentService.get(id, this.mapParams(_params)))
  }

  async create(data: Data, params?: ServiceParams): Promise<Result>
  async create(data: Data[], params?: ServiceParams): Promise<Result[]>
  async create(data: Data | Data[], params?: ServiceParams): Promise<Result | Result[]> {
    const mappedData = await mapAsync(data, (item) => this.mapData(null, item))
    const records = await this.currentService.create(mappedData, this.mapParams(params))
    await mapAsync(records, r => this.onSave(r))
    return this.mapToResults(records)
  }

  async update(id: NullableId, data: Data, _params?: ServiceParams): Promise<Result | Result[]> {
    return this.updateItems(id, _params, async original =>
      this.currentService.update(original._id, await this.mapData(original, data))
    )
  }

  async patch(id: NullableId, data: Patch, _params?: ServiceParams): Promise<Result | Result[]> {
    return this.updateItems(id, _params, async original =>
      this.currentService.patch(original._id, await this.mapPatch(original, data))
    )
  }

  private async updateItems(id: NullableId, _params: ServiceParams | undefined, mapper: (r: Record) => Promise<Record>): Promise<Result | Result[]> {
    const params = this.mapParams(_params)

    const items = id === null
      ? await this.currentService.find(params) as Record[]
      : await this.currentService.get(id, params) as Record
    
    return mapAsync(items, async item => {
      const result = await mapper(item)
      await this.onSave(result)
      return this.mapToResult(result)
    })
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<Result | Result[]> {
    return mapAsync(
      await this.currentService.remove(id, this.mapParams(_params)),
      async r => {
        await this.onRemove(r);
        return this.mapToResult(r)
      }
    )
  }

  protected mapToResults(results: Record | Record[]): Result | Result[] {
    return map(results, r => this.mapToResult(r))
  }

  protected mapParams(_params?: ServiceParams): Params | undefined {
    if (_params?.query === undefined) return _params

    const { query } = _params
    if ('$select' in query) {
      const { $select, ...rest } = query
      //Delete a troublesome undefined select query
      if ($select === undefined) {
        return {
          ..._params,
          query: {
            ...rest
          }
        }
      }
    }
    return _params
  }

  protected async mapData(_existing: Record | null, data: Data): Promise<Record> {
    return data as unknown as Record
  }

  protected async mapPatch(_existing: Record, data: Patch): Promise<Record> {
    return data as unknown as Record
  }

  protected mapToResult(record: Record): Result {
    return record as unknown as Result
  }

  protected onSave(result: Record): void | Promise<void> {}
  protected onRemove(result: Record): void | Promise<void> {}
}
