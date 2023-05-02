export default function computeIfAbsent<K,V>(map: Map<K, V>, key: K, getDefault: () => V): V {
  if (map.has(key)) {
    return map.get(key)!
  }
  const def = getDefault()
  map.set(key, def)
  return def
}
