import { ReadPath } from './paths'

export type Accessor<T, D = unknown> = FnAccessor<T, D> | PathAccessor<T, D>
export type FnAccessor<T, D = unknown> = (item: T) => D
export type PathAccessor<T, D> = ReadPath<T, D>

export function toAccessorFn<T, D>(accessor: Accessor<T, D>): FnAccessor<T, D> {
  if (typeof accessor === 'function') {
    return accessor
  }
  return ((item: T) => valueAtPath<T, any, any>(item, accessor)) as FnAccessor<T, D>
}

export function valueAtPath<T, P extends PathAccessor<T, D>, D>(item: T, path: P): ValueAthPath<T, P> {
  if (path === '') {
    return item as ValueAthPath<T, P>
  }
  const parts = String(path).split('.')
  let current: unknown = item
  for (const part of parts) {
    if (current == null) {
      return undefined as ValueAthPath<T, P>
    }
    current = current[part]
  }
  return current as ValueAthPath<T, P>
}
// valueAtPath({ a: [{ b: { c: 42 } }] }, 'a.0.b.c') // returns 42

export type ValueAthPath<T, P extends string | number> =
  P extends ''
    ? T
    : P extends `${infer K}.${infer Rest}`
      ? ValueAthPath<ValueAtKey<T, K>, Rest>
      : ValueAtKey<T, P>

type ValueAtKey<T, K> = K extends keyof T
  ? T[K]
  : K extends `${number}`
    ? T extends (infer U)[]
      ? U
      : never
    : never

// export function toAccessorFn<T, P extends PathAccessor<T, D>>(accessor: P): FnAccessor<T, D> {
//   return (item: T) => getValueAtPath(item, accessor)
// }
