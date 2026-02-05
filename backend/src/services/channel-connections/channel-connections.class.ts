// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'
import type { RealTimeConnection, Channel } from '@feathersjs/transport-commons'

import type { Application } from '../../declarations'
import type {
  ChannelConnections,
  ChannelConnectionsData,
  ChannelConnectionsQuery,
} from './channel-connections.schema'

export type { ChannelConnections, ChannelConnectionsData, ChannelConnectionsQuery }

export interface ChannelConnectionsServiceOptions {
  app: Application
}

export interface ChannelConnectionsParams extends Params<ChannelConnectionsQuery> {
  connection?: RealTimeConnection
}

const channelSymbolName = 'Symbol(@feathersjs/transport-commons/channels)'

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ChannelConnectionsService<
  ServiceParams extends ChannelConnectionsParams = ChannelConnectionsParams,
> implements
    ServiceInterface<ChannelConnections[], ChannelConnectionsData, ServiceParams> {
  app: Application
  channels: Record<string, Channel> | undefined

  constructor(public options: ChannelConnectionsServiceOptions) {
    const app = this.app = options.app
    const channelsKey = Object.getOwnPropertySymbols(app)
      .find(symbol => String(symbol) === channelSymbolName)
    if (channelsKey !== undefined) this.channels = (app as any)[channelsKey]
  }

  _getChannels() {
    if (!this.channels) return {}
    return this.channels
  }

  async find(_params?: ServiceParams): Promise<ChannelConnections[]> {
    if (!_params?.connection) return []
    const { connection } = _params

    const channels = this._getChannels()
    return Object.entries(channels)
      .filter(([, channel]) => channel.connections.includes(connection))
      .map(([name]) => name)
  }

  async create(
    data: ChannelConnectionsData,
    params?: ServiceParams,
  ): Promise<ChannelConnections[]> {
    if (!params?.connection) return []
    const { connection } = params

    this.app.channel(data.name).join(connection)

    return this.find(params)
  }

  async remove(id: string, _params?: ServiceParams): Promise<ChannelConnections[]> {
    if (!_params?.connection) return []
    const { connection } = _params

    this.app.channel(id).leave(connection)

    return this.find(_params)
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
