export function merge<T extends object>(obj: T, merged: Partial<T>): T {
  return { ...obj, ...merged }
}

export function assoc<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  if (obj[key] === value) {
    return obj
  }
  return { ...obj, [key]: value }
}

export function dissoc<K extends string, O extends object>(obj: O, key: K): Omit<O, K> {
  if (key in obj) {
    const { [key]: _, ...rest } = obj
    return rest
  }
  return obj
}

export function apply<T extends object, K extends keyof T>(obj: T, key: K, modifier: (val: T[K]) => T[K]): T {
  return assoc(obj, key, modifier(obj[key]))
}

export function push<T>(val: T): (arr: T[]) => T[] {
  return arr => [...arr, val]
}

export function pluck<T>(val: T): (arr: T[]) => T[] {
  return arr => arr.filter(item => item !== val)
}

export function filter<T>(condition: (val: T) => boolean): (arr: T[]) => T[] {
  return arr => arr.filter(condition)
}

export function pluckIndex<T>(index: number): (arr: T[]) => T[]  {
  return arr => arr.toSpliced(index, 1)
}

export function pushToIndex<T>(index: number, value: T): (arr: T[]) => T[]  {
  return arr => arr.toSpliced(index, 0, value)
}
