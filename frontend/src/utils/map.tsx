export function getOrComputeDefault<K, V>(
  map: Map<K, V>,
  key: K,
  getDefault: (key: K) => V,
): V {
  if (!map.has(key)) {
    const value = getDefault(key)
    map.set(key, value)
    return value
  }
  return map.get(key) as V
}
