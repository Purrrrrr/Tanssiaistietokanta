import {ChangeSet} from '../types'
import {arrayPatch} from './arrayPatch'
import {escapePathToken, Operation} from './jsonPatch'

export function toJSONPatch<T>(changes: ChangeSet<T>, pathBase = ''): Operation[] {
  switch (changes.type) {
    case 'array':
      return arrayPatch(changes, pathBase)
    case 'object':
      return Object.keys(changes.changes)
        .flatMap((key) => {
          const subChanges = changes.changes[key]
          return toJSONPatch(subChanges, `${pathBase}/${escapePathToken(key)}`)
        })
    case 'scalar':
      return [
        { op: 'replace', value: changes.changedValue, path: pathBase },
      ]
  }
}
