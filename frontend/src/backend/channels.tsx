import feathers, {socket} from './feathers'
import {getOrComputeDefault} from 'utils/map'

const listenersByChannel = new Map<string, Set<unknown>>()

export function ensureChannelIsOpen(channel : string, listenerId : any) {
  const listeners = getListeners(channel)
  if (listeners.size === 0) {
    openChannel(channel)
  }
  listeners.add(listenerId)
}
export function closeChannelIfUnsused(channel : string, listenerId : any) {
  const listeners = getListeners(channel)
  listeners.delete(listenerId)
  if (listeners.size === 0) {
    closeChannel(channel)
  }
}

function getListeners(channel : string) : Set<unknown> {
  return getOrComputeDefault(listenersByChannel, channel, () => new Set())
}

const channelService = feathers.service('channel-connections')

async function openChannel(channel : string) {
  console.log(`enable channel ${channel}`)
  await channelService.create({name: channel})
}
async function closeChannel(channel : string) {
  console.log(`disable channel ${channel}`)
  await channelService.remove(channel)
}

let channelsConnected = false
socket.on("connect", () => {
  if (!channelsConnected) {
    console.log('socket connected, enabling channels')
    listenersByChannel.forEach((_, channel) => openChannel(channel))
  }
  console.log(listenersByChannel)
  channelsConnected = true
});
socket.on("disconnect", () => {
  console.log('socket disconnected')
  channelsConnected = false
});
