import {ArrayPath} from '../types'

export function emptyPath<T>(): ArrayPath<T> {
  return [] as ArrayPath<T>
}
export function subPath<T extends object, K extends keyof T>(key : K, path : ArrayPath<T[K]>) : ArrayPath<T> {
  return [ key, ...path ] as ArrayPath<T>
}
export function subIndexPath<T>(index : number, path : ArrayPath<T>) : ArrayPath<T[]> {
  return [
    index, ...path
  ] as ArrayPath<T[]>
}
