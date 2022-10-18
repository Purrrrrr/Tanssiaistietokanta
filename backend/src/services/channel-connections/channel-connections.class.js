const channelSymbolName = 'Symbol(@feathersjs/transport-commons/channels)'

exports.ChannelConnections = class ChannelConnections {
  constructor (app) {
    this.app = app
    const channelsKey = Object.getOwnPropertySymbols(app)
      .find(symbol => String(symbol) === channelSymbolName)
    if (channelsKey !== null) this.channels = app[channelsKey]
  }

  _getChannels() {
    if (!this.channels) return {}
    return this.channels
  }

  async find ({ connection }) {
    if (!connection) return []

    const channels = this._getChannels()
    return Object.entries(channels)
      .filter(([, channel]) => channel.connections.includes(connection))
      .map(([name]) => name)
  }

  async create ({name}, { connection }) {
    if (!connection) return []

    this.app.channel(name).join(connection)

    return this.find({connection})
  }

  async remove (id, { connection }) {
    if (!connection) return []

    this.app.channel(id).leave(connection)

    return this.find({connection})
  }
}
