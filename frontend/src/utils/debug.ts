import debug from 'debug'

const knownNamespaces: string[] = [
  'socket.io-client',
  'socket.io-client:manager',
  'socket.io-client:url',
  'socket.io-client:socket',
  'dance-organizer',
]

export default function createDebugger(namespace: string) {
  const ns = `dance-organizer:${namespace}`
  knownNamespaces.push(ns)
  return debug(ns)
}

export function getKnownNamespaces(): Map<string, boolean> {
  return new Map(
    knownNamespaces.map(ns => [ns, debug.enabled(ns)]),
  )
}

export function enableNamespaces(namespaces: readonly string[]) {
  debug.enable(namespaces.join(','))
}
