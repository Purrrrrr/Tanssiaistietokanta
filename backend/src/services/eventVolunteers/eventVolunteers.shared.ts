// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { EventVolunteers, EventVolunteersData, EventVolunteersPatch, EventVolunteersQuery, EventVolunteersService } from './eventVolunteers.class'

export type { EventVolunteers, EventVolunteersData, EventVolunteersPatch, EventVolunteersQuery }

export type EventVolunteersClientService = Pick<EventVolunteersService<Params<EventVolunteersQuery>>, (typeof eventVolunteersMethods)[number]>

export const eventVolunteersPath = 'eventVolunteers'

export const eventVolunteersMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const eventVolunteersClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(eventVolunteersPath, connection.service(eventVolunteersPath), {
    methods: eventVolunteersMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [eventVolunteersPath]: EventVolunteersClientService
  }
}
