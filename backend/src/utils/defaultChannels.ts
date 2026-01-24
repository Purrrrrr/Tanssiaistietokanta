import type { HookContext } from '@feathersjs/feathers'
import type { Channel } from '@feathersjs/transport-commons'
import type { Application } from '../declarations'

export function defaultChannels(app: Application, context: HookContext) {
  const { id, path: serviceName } = context

  const channels = [
    app.channel(serviceName)
  ]
  if (id) {
    channels.push(
      app.channel(`${serviceName}/${id}`)
    )
  }

  return withoutCurrentConnection(channels, context)
}

export function withoutCurrentConnection(channels: Channel[], context: HookContext) {
  const { params: { connection } } = context
  if (!connection) return channels

  return channels.map(channel =>
    channel.filter(conn => {
      return conn !== connection
    })
  )
}
