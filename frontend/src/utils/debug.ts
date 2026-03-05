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

if (process.env.NODE_ENV === 'development') {
  debug.formatters.t = (v: unknown) => {
    if (!Array.isArray(v)) {
      return JSON.stringify(v)
    }
    // Imitate console.table for arrays of objects
    const items = v.filter(item => typeof item === 'object' && item !== null)
    const keys = Array.from(new Set(items.flatMap(item => Object.keys(item))))
    const stringifyValue = (value: unknown) => typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)
    const table = [keys, ...v.map(item => keys.map(key => stringifyValue(item[key])))]
    const columnWidths = keys.map((_, index) => Math.max(...table.map(row => row[index].length)))
    const separator = columnWidths.map(width => '-'.repeat(width))
    table.splice(1, 0, separator)

    return `\n${table.map(row => row.map((cell, index) => cell.padEnd(columnWidths[index])).join(' | ')).join('\n')}`
  }
} else {
  debug.formatters.t = JSON.stringify
}
