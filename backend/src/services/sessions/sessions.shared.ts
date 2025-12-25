// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Sessions, SessionsData, SessionsPatch, SessionsQuery, SessionsService } from './sessions.class'

export type { Sessions, SessionsData, SessionsPatch, SessionsQuery }

export type SessionsClientService = Pick<
  SessionsService<Params<SessionsQuery>>,
  (typeof sessionsMethods)[number]
>

export const sessionsPath = 'sessions'

export const sessionsMethods: Array<keyof SessionsService> = ['find', 'get', 'create', 'patch', 'remove']

export const sessionsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(sessionsPath, connection.service(sessionsPath), {
    methods: sessionsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [sessionsPath]: SessionsClientService
  }
}
