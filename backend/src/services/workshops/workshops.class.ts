// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params } from '@feathersjs/feathers'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

import type { Application } from '../../declarations'
import type { Workshops, WorkshopsData, WorkshopsPatch, WorkshopsQuery } from './workshops.schema'

export type { Workshops, WorkshopsData, WorkshopsPatch, WorkshopsQuery }

export interface WorkshopsServiceOptions {
  app: Application
}

export interface WorkshopsParams extends Params<WorkshopsQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class WorkshopsService<ServiceParams extends WorkshopsParams = WorkshopsParams>
  extends VersioningNeDBService<Workshops, WorkshopsData, ServiceParams, WorkshopsPatch> {
  constructor(public options: WorkshopsServiceOptions) {
    super({
      ...options,
      dbname: 'workshops',
    })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
