import NeDB from '@seald-io/nedb'
import path from 'path'

import type { Application } from '../../declarations'
import { Validator } from '@feathersjs/schema'
import { AccessStrategyDataStore } from './strategies'
import { getValidator, Static, TObject, TSchema } from '@feathersjs/typebox'
import { dataValidator } from '../../validators'

export class AccessDataStoreFactory {
  private app: Application
  private neDBInstances = new Map<string, NeDB>()

  constructor(app: Application) {
    this.app = app
  }

  public getStore<Schema extends TSchema>(
    service: string,
    schema: Schema,
    defaultData: Static<Schema>,
  ): NedbAccessDataStore<Static<Schema>> {
    let neDB = this.neDBInstances.get(service)

    if (!neDB) {
      neDB = new NeDB({
        filename: path.resolve(
          this.app.get('nedb'),
          `${service}-access.db`,
        ),
        autoload: true,
      })
      neDB.ensureIndex({ fieldName: 'entityId' })
      this.neDBInstances.set(service, neDB)
    }

    return new NedbAccessDataStore<Static<Schema>>(neDB, schema as any, defaultData)
  }
}

interface AccessData<Data> {
  _id?: string
  entityId: string | number
  data: Data
}

class NedbAccessDataStore<Data> implements AccessStrategyDataStore<Data> {
  public dataValidator: Validator<Data>

  constructor(
    private neDB: NeDB<AccessData<Data>>,
    schema: TObject,
    private defaultData: Data,
  ) {
    this.dataValidator = getValidator(schema, dataValidator)
  }

  async getAccess(entityId: string | number): Promise<Data> {
    const doc = await this.neDB.findOneAsync({ entityId }).execAsync()
    return doc?.data ?? this.defaultData
  }

  async setAccess(entityId: string | number, data: Data): Promise<void> {
    await this.neDB.updateAsync({ entityId }, { entityId, data }, { upsert: true })
  }
}
