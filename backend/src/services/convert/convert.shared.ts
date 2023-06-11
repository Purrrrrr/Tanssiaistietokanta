// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Convert, ConvertData, ConvertQuery, ConvertService } from './convert.class'

export type { Convert, ConvertData, ConvertQuery }

export type ConvertClientService = Pick<ConvertService<Params<ConvertQuery>>, (typeof convertMethods)[number]>

export const convertPath = 'convert'

export const convertMethods = ['find', 'create'] as const

export const convertClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(convertPath, connection.service(convertPath), {
    methods: convertMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [convertPath]: ConvertClientService
  }
}
