// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ChannelConnections,
  ChannelConnectionsData,
  ChannelConnectionsQuery,
  ChannelConnectionsService,
} from './channel-connections.class'

export type { ChannelConnections, ChannelConnectionsData, ChannelConnectionsQuery }

export type ChannelConnectionsClientService = Pick<
  ChannelConnectionsService<Params<ChannelConnectionsQuery>>,
  (typeof channelConnectionsMethods)[number]
>

export const channelConnectionsPath = 'channel-connections'

export const channelConnectionsMethods = ['find', 'create', 'remove'] as const

export const channelConnectionsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(channelConnectionsPath, connection.service(channelConnectionsPath), {
    methods: channelConnectionsMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [channelConnectionsPath]: ChannelConnectionsClientService
  }
}
