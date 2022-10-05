import feathers, {socket} from './feathers'
import {getOrComputeDefault} from 'utils/map'
import createDebug from 'utils/debug'

const debug = createDebug('channels')

let socketConnected = false
socket.on("connect", () => {
  if (!socketConnected) {
    debug('socket connected, enabling channels')
    listenersByChannel.forEach((listeners, channel) => {
      if (listeners.size > 0) openChannel(channel)
    })
  }
  socketConnected = true
});
socket.on("disconnect", () => {
  debug('socket disconnected')
  socketConnected = false
});

const listenersByChannel = new Map<string, Set<unknown>>()

export function ensureChannelIsOpen(channel : string, listenerId : any) {
  const listeners = getListeners(channel)
  if (socketConnected && listeners.size === 0 ) {
    openChannel(channel)
  }
  listeners.add(listenerId)
}
export function closeChannelIfUnsused(channel : string, listenerId : any) {
  const listeners = getListeners(channel)
  listeners.delete(listenerId)
  if (socketConnected && listeners.size === 0) {
    closeChannel(channel)
  }
}

function getListeners(channel : string) : Set<unknown> {
  return getOrComputeDefault(listenersByChannel, channel, () => new Set())
}

const channelService = feathers.service('channel-connections')

async function openChannel(channel : string) {
  debug(`enable channel ${channel}`)
  await channelService.create({name: channel})
}
async function closeChannel(channel : string) {
  debug(`disable channel ${channel}`)
  await channelService.remove(channel)
}
