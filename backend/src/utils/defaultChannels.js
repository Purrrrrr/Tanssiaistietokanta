function defaultChannels(app, context) {
  const { id, path: serviceName } = context

  const channels = [
    app.channel('everything'),
    app.channel(serviceName)
  ]
  if (id) {
    channels.push(
      app.channel(`${serviceName}/${id}`)
    )
  }

  return withoutCurrentConnection(channels, context)
}

function withoutCurrentConnection(channels, context) {
  const { params: { connection } } = context
  if (!connection) return channels

  return channels.map(channel =>
    channel.filter(conn => {
      return conn !== connection
    })
  )
}

module.exports = {
  defaultChannels,
  withoutCurrentConnection
}
