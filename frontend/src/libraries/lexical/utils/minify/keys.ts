import { KEY_MAP, KEY_UNMAP } from './constants'

export const minifyKey = (key: string) => {
  if (process.env.NODE_ENV === 'development') {
    if (!(key in KEY_MAP)) {
      console.warn(`Unexpected key in node: ${key}`)
    }
  }
  if (key in KEY_MAP) {
    return KEY_MAP[key]
  }
  // Avoid collisions with mapped keys
  return key in KEY_UNMAP
    ? `_${key}
    ` : key
}

export const expandKey = (key: string) => {
  if (process.env.NODE_ENV === 'development') {
    if (!(key in KEY_UNMAP) && !(key in KEY_MAP) && !key.startsWith('_')) {
      console.warn(`Unexpected key in minified node: ${key}`)
    }
  }
  if (key in KEY_UNMAP) {
    return KEY_UNMAP[key]
  }
  if (key.startsWith('_')) {
    const unprefixed = key.slice(1)
    if (unprefixed in KEY_MAP) {
      // Reverse of minify's collision avoidance
      return unprefixed
    }
  }
  return key
}
