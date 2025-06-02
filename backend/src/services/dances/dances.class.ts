import type { Id, Params, } from '@feathersjs/feathers'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

import type { Application } from '../../declarations'
import type { Dances, DancesData, DancesPatch, DancesQuery } from './dances.schema'

export type { Dances, DancesData, DancesPatch, DancesQuery }

export interface DancesServiceOptions {
  app: Application
}

export interface DancesParams extends Params<DancesQuery> {}

export class DancesService<ServiceParams extends DancesParams = DancesParams>
  extends VersioningNeDBService<Dances, DancesData, ServiceParams, DancesPatch>
{
  constructor(public options: DancesServiceOptions) {
    super({ ...options, dbname: 'dances'})
  }

  async get(id: Id, _params?: ServiceParams): Promise<Dances> {
    const r = await super.get(id, _params)
    try {
      r.wikipage = await this.options.app.service('dancewiki').get(r.name, { updateFromWiki: true })
    } catch (_) {
      //404
    }

    return r
  }
}
export const getOptions = (app: Application) => {
  return { app }
}
