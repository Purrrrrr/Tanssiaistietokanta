export type ValueOf<P extends object> = P[AllowedKeys<P>]
type AllowedKeys<P> = Exclude<keyof P, '__typename'>

export function getSingleValue<T extends object>(obj: T): ValueOf<T> {
  return obj[getSingleKey(obj)]
}

export function getSingleKey<T extends object>(obj: T): AllowedKeys<T> {
  const keys = Object.keys(obj)
    .filter(key => key !== '__typename') as AllowedKeys<T>[]
  if (keys.length !== 1) {
    const keysStr = keys.join(',')
    throw new Error(`Expected object to have one key, found ${keysStr}`)
  }

  return keys[0]
}
