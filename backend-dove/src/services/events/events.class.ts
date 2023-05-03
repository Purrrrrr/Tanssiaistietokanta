// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params } from '@feathersjs/feathers'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

import type { Application } from '../../declarations'
import type { Events, EventsData, EventsPatch, EventsQuery } from './events.schema'

export type { Events, EventsData, EventsPatch, EventsQuery }

export interface EventsServiceOptions {
  app: Application
}

export interface EventsParams extends Params<EventsQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class EventsService<ServiceParams extends EventsParams = EventsParams>
  extends VersioningNeDBService<Events, EventsData, ServiceParams, EventsPatch>
{
  constructor(public options: EventsServiceOptions) {
    super({ ...options, dbname: 'events'})
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
