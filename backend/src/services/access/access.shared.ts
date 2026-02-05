// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Access, AccessQuery, AccessService } from './access.class'

export type { Access, AccessQuery }

export type AccessClientService = Pick<AccessService<Params<AccessQuery>>, (typeof accessMethods)[number]>

export const accessPath = 'access'

export const accessMethods: (keyof AccessService)[] = ['find']

export const accessClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(accessPath, connection.service(accessPath), {
    methods: accessMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [accessPath]: AccessClientService
  }
}
