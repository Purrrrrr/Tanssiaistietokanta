import type { AnyNode, KeyMapping } from './types'

/** Creates a validated `KeyMapping` from a long→short abbreviation record. */
export function createKeyMapping(map: Record<string, string>): KeyMapping {
  if (process.env.NODE_ENV === 'development') {
    const values = Object.values(map)
    const duplicates = values.filter((v, i) => values.indexOf(v) !== i)
    if (duplicates.length > 0) {
      throw new Error(`Duplicate values in key mapping: ${duplicates.join(', ')}`)
    }
  }
  const unmap = Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]))
  return { map, unmap }
}

/** Returns the minified (short) version of `key` using the given mapping.
 *  Keys that collide with an existing short code are prefixed with `_`. */
export function applyMinifyKey(mapping: KeyMapping, key: string): string {
  if (process.env.NODE_ENV === 'development') {
    if (!(key in mapping.map)) {
      console.warn(`Unexpected key in node: ${key}`)
    }
  }
  if (key in mapping.map) return mapping.map[key]
  // Avoid collisions with mapped short codes
  return key in mapping.unmap ? `_${key}` : key
}

/** Returns the original (long) version of a minified `key`. */
export function applyExpandKey(mapping: KeyMapping, key: string): string {
  if (process.env.NODE_ENV === 'development') {
    if (!(key in mapping.unmap) && !(key in mapping.map) && !key.startsWith('_')) {
      console.warn(`Unexpected key in minified node: ${key}`)
    }
  }
  if (key in mapping.unmap) return mapping.unmap[key]
  if (key.startsWith('_')) {
    const unprefixed = key.slice(1)
    // Reverse of minify's collision avoidance prefix
    if (unprefixed in mapping.map) return unprefixed
  }
  return key
}

/** Returns a new object with all keys minified using the mapping. */
export function minifyObjectKeys(mapping: KeyMapping, obj: AnyNode): AnyNode {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [applyMinifyKey(mapping, key), value]),
  )
}

/** Returns a new object with all keys expanded using the mapping. */
export function expandObjectKeys(mapping: KeyMapping, obj: AnyNode): AnyNode {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [applyExpandKey(mapping, key), value]),
  )
}
