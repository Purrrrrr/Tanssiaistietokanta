import {Path} from './types'

export function emptyPath<T>(): Path<T> {
  return [] as Path<T>
}
export function subPath<T extends object, K extends keyof T>(key : K, path : Path<T[K]>) : Path<T> {
  // @ts-ignore */
  return [
    key, ...path
  ] as unknown as Path<T>
}
export function subIndexPath<T>(index : number, path : Path<T>) : Path<T[]> {
  return [
    index, ...path
  ] as Path<T[]>
}
