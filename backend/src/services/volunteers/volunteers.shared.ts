// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Volunteers, VolunteersData, VolunteersPatch, VolunteersQuery, VolunteersService } from './volunteers.class'

export type { Volunteers, VolunteersData, VolunteersPatch, VolunteersQuery }

export type VolunteersClientService = Pick<VolunteersService<Params<VolunteersQuery>>, (typeof volunteersMethods)[number]>

export const volunteersPath = 'volunteers'

export const volunteersMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const volunteersClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(volunteersPath, connection.service(volunteersPath), {
    methods: volunteersMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [volunteersPath]: VolunteersClientService
  }
}
