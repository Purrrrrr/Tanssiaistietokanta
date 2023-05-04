// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { workshopsClient } from './services/workshops/workshops.shared'
export type {
  Workshops,
  WorkshopsData,
  WorkshopsQuery,
  WorkshopsPatch
} from './services/workshops/workshops.shared'

import { eventsClient } from './services/events/events.shared'
export type { Events, EventsData, EventsQuery, EventsPatch } from './services/events/events.shared'

import { dancesClient } from './services/dances/dances.shared'
export type { Dances, DancesData, DancesQuery, DancesPatch } from './services/dances/dances.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the backend-2real app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(dancesClient)
  client.configure(eventsClient)
  client.configure(workshopsClient)
  return client
}
