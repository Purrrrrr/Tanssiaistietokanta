// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Graphql, GraphqlData, GraphqlPatch, GraphqlQuery, GraphqlService } from './graphql.class'

export type { Graphql, GraphqlData, GraphqlPatch, GraphqlQuery }

export type GraphqlClientService = Pick<GraphqlService<Params<GraphqlQuery>>, (typeof graphqlMethods)[number]>

export const graphqlPath = 'graphql'

export const graphqlMethods = ['find', 'getMiddleware'] as const

export const graphqlClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(graphqlPath, connection.service(graphqlPath), {
    methods: graphqlMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [graphqlPath]: GraphqlClientService
  }
}
