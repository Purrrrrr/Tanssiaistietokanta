import {Entity} from './types'

export function map<K, V>(...arr: (readonly [K, V])[]): Map<K, V> {
  return new Map(arr)
}
export const toEntity = (item: Entity | number | string) => typeof item !== 'object' ? {_id: item, value: item} : item

//mulberry32
export function randomGeneratorWithSeed(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5
    /* eslint-disable */
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
    /* eslint-enable */
  }
}

export function changedVersion(
  original: Entity[],
  random: () => number,
  amounts: {add?: number, remove?: number, move?: number}

) {
  const {add = 0, remove = 0, move = 0} = amounts
  const version = [...original]

  let i = 100
  const randomIndex = (arr: unknown[]) => Math.floor(random()*arr.length)
  const addRandom = (arr: unknown[]) => arr.splice(randomIndex(arr), 0, toEntity(++i))
  const removeRandom = (arr: unknown[]) => arr.splice(randomIndex(arr), 1)
  const moveRandom = (arr: unknown[]) => {
    const from = randomIndex(arr)
    const [val] = arr.splice(from, 1)
    arr.splice(randomIndex(arr), 0, val)
  }

  repeatIn(version, add, addRandom)
  repeatIn(version, remove, removeRandom)
  repeatIn(version, move, moveRandom)

  return version
}

const repeatIn = (arr: unknown[], num: number, action: (arr: unknown[]) => unknown) => {
  for(let i = 0; i < num; i++) action(arr)
}
