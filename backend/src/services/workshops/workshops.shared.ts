// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Workshops,
  WorkshopsData,
  WorkshopsPatch,
  WorkshopsQuery,
  WorkshopsService,
} from './workshops.class'

export type { Workshops, WorkshopsData, WorkshopsPatch, WorkshopsQuery }

export type WorkshopsClientService = Pick<
  WorkshopsService<Params<WorkshopsQuery>>,
  (typeof workshopsMethods)[number]
>

export const workshopsPath = 'workshops'

export const workshopsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const workshopsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(workshopsPath, connection.service(workshopsPath), {
    methods: workshopsMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [workshopsPath]: WorkshopsClientService
  }
}
