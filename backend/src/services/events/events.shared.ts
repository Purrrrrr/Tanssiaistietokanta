// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Events, EventsData, EventsPatch, EventsQuery, EventsService } from './events.class'

export type { Events, EventsData, EventsPatch, EventsQuery }

export type EventsClientService = Pick<EventsService<Params<EventsQuery>>, (typeof eventsMethods)[number]>

export const eventsPath = 'events'

export const eventsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const eventsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(eventsPath, connection.service(eventsPath), {
    methods: eventsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [eventsPath]: EventsClientService
  }
}
