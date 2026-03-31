// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { EventRoles, EventRolesData, EventRolesPatch, EventRolesQuery, EventRolesService } from './eventRoles.class'

export type { EventRoles, EventRolesData, EventRolesPatch, EventRolesQuery }

export type EventRolesClientService = Pick<EventRolesService<Params<EventRolesQuery>>, (typeof eventRolesMethods)[number]>

export const eventRolesPath = 'eventRoles'

export const eventRolesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const eventRolesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(eventRolesPath, connection.service(eventRolesPath), {
    methods: eventRolesMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [eventRolesPath]: EventRolesClientService
  }
}
