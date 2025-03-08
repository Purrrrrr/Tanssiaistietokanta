export function merge<T extends object >(obj: T, merged: Partial<T>): T {
  return { ...obj, ...merged }
}

export function assoc<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  if (obj[key] === value) {
    return obj
  }
  return { ...obj, [key]: value }
}

export function dissoc<T>(obj: Record<string, T>, key: string): Record<string, T> {
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
