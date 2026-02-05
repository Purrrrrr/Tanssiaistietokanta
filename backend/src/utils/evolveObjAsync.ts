import { curry } from 'ramda'

const evolveObjAsyncCurried = curry(evolveObjAsync)

export default evolveObjAsyncCurried

type Scalars = string | number

type Transformation<T> =
  ((t: T) => T | Promise<T>)
  | TransformationObject<T>
  | Scalars
type TransformationObject<T> = {
  [K in keyof T]: Transformation<T[K]>
}

async function evolveObjAsync<T>(transformations: TransformationObject<T>, object: T): Promise<T> {
  if (object === null) return object
  if (typeof object !== 'object') return object

  const result: T = object instanceof Array
    ? [...object] as T
    : { ...object }

  const keys = Object.keys(object) as (keyof T)[]
  for (const key of keys) {
    if (key in transformations) {
      result[key] = await getModifiedValue<T[typeof key]>(transformations[key], object[key])
    }
  }

  return result
}

async function getModifiedValue<T>(transformation: Transformation<T>, value: T): Promise<T> {
  switch (typeof transformation) {
    case 'function':
      return await transformation(value)
    case 'object':
      return await evolveObjAsync<T>(transformation, value)
    default:
      return transformation as T
  }
}
