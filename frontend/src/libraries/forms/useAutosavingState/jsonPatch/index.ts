import { Operation } from './types'
import { Entity } from '../types'

import { arrayPatch } from './arrayPatch'

export type { Operation } from './types'

export function toJSONPatch<T>(original: T, changed: T, pathBase = ''): Operation[] {
  const commonType = getCommonType(original, changed)

  if (commonType === 'array') {
    return arrayPatch(original as Entity[], changed as Entity[], toJSONPatch, pathBase)
  }
  if (commonType === 'object') {
    return objectPatch(original as object, changed as object, pathBase)
  }

  if (original === changed) {
    return []
  }

  return [
    {
      op: 'replace',
      value: changed,
      path: pathBase,
    },
  ]
}

function getCommonType(original: unknown, changed: unknown) {
  const originalType = getType(original)
  const changedType = getType(changed)

  return originalType === changedType ? originalType : null
}

function getType(value: unknown) {
  if (value == null) return 'undefined'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function objectPatch(original: object, changed: object, pathBase: string): Operation[] {
  const ops: Operation[] = []
  for (const key of Object.keys(original)) {
    if (key in changed) {
      ops.push(...toJSONPatch(original[key], changed[key], `${pathBase}/${escapePathToken(key)}`))
    } else {
      ops.push({
        op: 'remove', path: `${pathBase}/${escapePathToken(key)}`,
      })
    }
  }
  for (const key of Object.keys(changed)) {
    if (!(key in original)) {
      ops.push({
        op: 'add', path: `${pathBase}/${escapePathToken(key)}`, value: changed[key],
      })
    }
  }
  return ops
}

export function escapePathToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1')
}
