import createDebug from 'utils/debug'
import {getOrComputeDefault} from 'utils/map'

import {makeFeathersRequest, socket} from './feathers'

const debug = createDebug('channels')

let socketConnected = false
socket.on('connect', () => {
  if (!socketConnected) {
    debug('socket connected, enabling channels')
    listenersByChannel.forEach((listeners, channel) => {
      if (listeners.size > 0) openChannel(channel)
    })
  }
  socketConnected = true
})
socket.on('disconnect', () => {
  debug('socket disconnected')
  socketConnected = false
})

const listenersByChannel = new Map<string, Set<unknown>>()

export function ensureChannelIsOpen(channel : string, listenerId: unknown) {
  const listeners = getListeners(channel)
  if (socketConnected && listeners.size === 0 ) {
    openChannel(channel)
  }
  listeners.add(listenerId)
}
export function closeChannelIfUnsused(channel : string, listenerId: unknown) {
  const listeners = getListeners(channel)
  listeners.delete(listenerId)
  if (socketConnected && listeners.size === 0) {
    closeChannel(channel)
  }
}

function getListeners(channel : string) : Set<unknown> {
  return getOrComputeDefault(listenersByChannel, channel, () => new Set())
}

async function openChannel(channel : string) {
  debug(`enable channel ${channel}`)
  const result = await makeFeathersRequest('channel-connections', 'create', {name: channel})
  debug('current channels: ', result)
}
async function closeChannel(channel : string) {
  debug(`disable channel ${channel}`)
  const result = await makeFeathersRequest('channel-connections', 'remove', channel)
  debug('current channels: ', result)
}
