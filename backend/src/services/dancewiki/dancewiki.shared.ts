// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Dancewiki,
  DancewikiData,
  DancewikiQuery,
  DancewikiService
} from './dancewiki.class'

export type { Dancewiki, DancewikiData, DancewikiQuery }

export type DancewikiClientService = Pick<
  DancewikiService<Params<DancewikiQuery>>,
  (typeof dancewikiMethods)[number]
>

export const dancewikiPath = 'dancewiki'

export const dancewikiMethods: Array<keyof DancewikiService> = ['find', 'get', 'update', 'create']

export const dancewikiClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(dancewikiPath, connection.service(dancewikiPath), {
    methods: dancewikiMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [dancewikiPath]: DancewikiClientService
  }
}
