// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Events, EventsData, EventsPatch, EventsQuery } from './events.schema'

export type { Events, EventsData, EventsPatch, EventsQuery }

export interface EventsServiceOptions {
  app: Application
}

export interface EventsParams extends Params<EventsQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class EventsService<ServiceParams extends EventsParams = EventsParams>
  implements ServiceInterface<Events, EventsData, ServiceParams, EventsPatch>
{
  constructor(public options: EventsServiceOptions) {}

  async find(_params?: ServiceParams): Promise<Events[]> {
    return []
  }

  async get(id: Id, _params?: ServiceParams): Promise<Events> {
    return {
      id: 0,
      text: `A new message with ID: ${id}!`
    }
  }

  async create(data: EventsData, params?: ServiceParams): Promise<Events>
  async create(data: EventsData[], params?: ServiceParams): Promise<Events[]>
  async create(data: EventsData | EventsData[], params?: ServiceParams): Promise<Events | Events[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return {
      id: 0,
      ...data
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id: NullableId, data: EventsData, _params?: ServiceParams): Promise<Events> {
    return {
      id: 0,
      ...data
    }
  }

  async patch(id: NullableId, data: EventsPatch, _params?: ServiceParams): Promise<Events> {
    return {
      id: 0,
      text: `Fallback for ${id}`,
      ...data
    }
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<Events> {
    return {
      id: 0,
      text: 'removed'
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
