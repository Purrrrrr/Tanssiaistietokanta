import {Entity} from './types'

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
  amounts: {add?: number, remove?: number, move?: number, addKeys?: number, removeKeys?: number, modifyValues?: number}

) {
  const {add = 0, remove = 0, move = 0, addKeys = 0, removeKeys = 0, modifyValues = 0} = amounts
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
  const addKey = (arr: Entity[]) => {
    modifySomeObject(arr, obj => {
      const key = 'key-'+random()
      return {
        ...obj,
        [key]: random(),
      }
    })
  }
  const removeKey = (arr: Entity[]) => {
    modifySomeObject(arr, obj => {
      const res = { ...obj }
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete res[randomKey(res)]
      return res
    })
  }
  const modifyKey = (arr: Entity[]) => {
    modifySomeObject(arr, obj => {
      const res = { ...obj }
      res[randomKey(res)] = random()
      return res
    })
  }
  const randomKey = (obj: Entity) => {
    const keys = Object.keys(obj).filter(key => key !== '_id')
    return keys[randomIndex(keys)]
  }
  const modifySomeObject = (arr: Entity[], modifier: (e: Entity) => Entity) => {
    const at = randomIndex(arr)
    arr[at] = modifier(arr[at])
  }

  repeatIn(version, add, addRandom)
  repeatIn(version, remove, removeRandom)
  repeatIn(version, move, moveRandom)
  repeatIn(version, addKeys, addKey)
  repeatIn(version, removeKeys, removeKey)
  repeatIn(version, modifyValues, modifyKey)

  return version
}

const repeatIn = <T>(arr: T[], num: number, action: (arr: T[]) => unknown) => {
  for(let i = 0; i < num; i++) action(arr)
}
