import {Path, Key} from './types'
import deepEquals from 'fast-deep-equal'

export type PatchResult<Patch> = {hasModifications: false} | {patch: Patch, hasModifications: true}
export type PatchStrategy<T, Patch> = (original: T, modifications: T, conflicts: Path<T>[]) => PatchResult<Patch> 

export function noPatch<T>(original : T, modifications : T, conflicts: Key[][]): PatchResult<T>  {
  const partial = makePartial<T>(original, modifications, conflicts)
  if (!partial.hasModifications) return partial
  
  return {
    hasModifications: true, 
    patch: {
      ...original,
      ...partial.patch
    }
  }
}

/*
type Id = string
interface ArrayPatch {
  removed: Id[]
  structure: Id[]
}
*/

//Typing conflicts as Path[] makes typescript crash, dunno why
export function makePartial<T>(original : T, modifications : T, conflicts: Key[][]): PatchResult<Partial<T>>  {
  const conflicKeys : Set<keyof T> = new Set()
  for (const path of conflicts) {
    if (path.length === 0) return {hasModifications: false}
    conflicKeys.add(path[0] as keyof T)
  }
  
  const partial : Partial<T> = {}
  let hasModifications = false
  for (const key in modifications) {
    if (conflicKeys.has(key)) continue
    if (deepEquals(modifications[key], original[key])) continue

    partial[key] = modifications[key]
    hasModifications = true
  }

  return hasModifications
    ? {
      hasModifications, 
      patch: partial,
    } : {hasModifications}
}
