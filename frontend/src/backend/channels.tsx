import feathers from './feathers'

const listenersByChannel = new Map()

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

function getListeners(channel : string) : Set<any> {
  if (!listenersByChannel.has(channel)) {
    const listenerSet = new Set()
    listenersByChannel.set(channel, listenerSet)
  }
  return listenersByChannel.get(channel)
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
