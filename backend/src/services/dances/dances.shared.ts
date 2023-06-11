// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Dances, DancesData, DancesPatch, DancesQuery, DancesService } from './dances.class'

export type { Dances, DancesData, DancesPatch, DancesQuery }

export type DancesClientService = Pick<DancesService<Params<DancesQuery>>, (typeof dancesMethods)[number]>

export const dancesPath = 'dances'

export const dancesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const dancesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(dancesPath, connection.service(dancesPath), {
    methods: dancesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [dancesPath]: DancesClientService
  }
}
