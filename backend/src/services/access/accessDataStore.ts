import NeDB from '@seald-io/nedb'
import path from 'path'

import type { Application } from '../../declarations'
import { Validator } from '@feathersjs/schema'
import { AccessStrategyDataStore } from './strategies'
import { getValidator, Static, TObject, TSchema } from '@feathersjs/typebox'
import { dataValidator } from '../../validators'

export class AccessDataStoreFactory {
  private neDB: NeDB
  constructor(app: Application) {
    this.neDB = new NeDB({
      filename: path.resolve(
        app.get('nedb'),
        'access-data.db',
      ),
      autoload: true,
    })
    this.neDB.ensureIndex({ fieldName: ['service', 'entityId'] })
  }

  public getStore<Schema extends TSchema>(
    service: string,
    schema: Schema,
    defaultData: Static<Schema>,
  ): NedbAccessDataStore<Static<Schema>> {
    return new NedbAccessDataStore<Static<Schema>>(this.neDB, service, schema as any, defaultData)
  }
}

interface AccessData<Data> {
  _id?: string
  entityId: string | number
  service: string
  data: Data
}

class NedbAccessDataStore<Data> implements AccessStrategyDataStore<Data> {
  public dataValidator: Validator<Data>

  constructor(
    private neDB: NeDB<AccessData<Data>>,
    private service: string,
    schema: TObject,
    private defaultData: Data,
  ) {
    this.dataValidator = getValidator(schema, dataValidator)
  }

  async getAccess(entityId: string | number): Promise<Data> {
    const doc = await this.neDB.findOneAsync({ entityId, service: this.service }).execAsync()
    return doc?.data ?? this.defaultData
  }

  async setAccess(entityId: string | number, data: Data): Promise<void> {
    const query = { entityId, service: this.service }
    await this.neDB.updateAsync(query, { ...query, data }, { upsert: true })
  }
}
