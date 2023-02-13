import {ChangeSet, ObjectKeyRemovals, Operation, RemovedKey} from './types'

import {arrayPatch} from './arrayPatch'

export function toJSONPatch<T>(changes: ChangeSet<T>, pathBase = ''): Operation[] {
  switch (changes.type) {
    case 'array':
      return arrayPatch(changes, toJSONPatch, pathBase)
    case 'object':
    {
      const modifications = Object.keys(changes.changes)
        .flatMap((key) => {
          const subChanges = changes.changes[key]
          return toJSONPatch(subChanges, `${pathBase}/${escapePathToken(key)}`)
        })
      return [
        ...getAdditions(changes.additions, pathBase),
        ...getRemovals(changes.removed, pathBase),
        ...modifications
      ]
    }
    case 'scalar':
      return [
        { op: 'replace', value: changes.changedValue, path: pathBase },
      ]
  }
}

export function getAdditions<T>(additions: Partial<T> | undefined, pathBase: string): Operation[] {
  if (additions === undefined) return []
  return Object.keys(additions)
    .map((key) => {
      return {
        op: 'add', path: `${pathBase}/${escapePathToken(key)}`, value: additions[key],
      }
    })
}

export function getRemovals<T>(removed: ObjectKeyRemovals<T> | undefined, pathBase: string): Operation[] {
  if (removed === undefined) return []
  return Object.keys(removed)
    .filter((key) => {
      const change = removed[key as keyof T]
      if (change === undefined) return false
      if (change.hasConflict && 'remainingServerValue' in (change as RemovedKey<unknown>)) return false
      return true
    })
    .map((key) => {
      return {
        op: 'remove', path: `${pathBase}/${escapePathToken(key)}`,
      }
    })
}

export function escapePathToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1')
}

