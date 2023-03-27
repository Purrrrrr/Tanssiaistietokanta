import {ChangeSet, ObjectKeyRemovals, Operation, Preference, RemovedKey} from './types'

import {arrayPatch} from './arrayPatch'

export type {Operation} from './types'

export function toJSONPatch<T>(changes: ChangeSet<T>, preferVersion: Preference, pathBase = ''): Operation[] {
  switch (changes.type) {
    case 'array':
      return arrayPatch(changes, toJSONPatch, preferVersion, pathBase)
    case 'object':
    {
      const modifications = Object.keys(changes.changes)
        .flatMap((key) => {
          const subChanges = changes.changes[key]
          if (subChanges === undefined) return []
          return toJSONPatch(subChanges, preferVersion, `${pathBase}/${escapePathToken(key)}`)
        })
      return [
        ...getAdditions(changes.additions, pathBase),
        ...getRemovals(changes.removed, preferVersion, pathBase),
        ...modifications
      ]
    }
    case 'scalar':
      return [
        {
          op: 'replace',
          value: ('conflictingLocalValue' in changes && preferVersion === 'LOCAL') ? changes.conflictingLocalValue : changes.changedValue,
          path: pathBase
        },
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

export function getRemovals<T>(removed: ObjectKeyRemovals<T> | undefined, preferVersion: Preference, pathBase: string): Operation[] {
  if (removed === undefined) return []
  return Object.keys(removed)
    .filter((key) => {
      const change = removed[key as keyof T]
      if (change === undefined) return false
      if (change.hasConflict) {
        const removedKey = (change as RemovedKey<unknown>)
        if (preferVersion === 'SERVER' && 'remainingServerValue' in removedKey) return false
        if (preferVersion === 'LOCAL' && 'remainingLocalValue' in removedKey) return false
      }
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

