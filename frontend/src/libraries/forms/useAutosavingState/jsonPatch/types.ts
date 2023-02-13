import {ChangeSet} from '../types'

export type {ArrayChangeSet, ChangeSet, ID, ObjectKeyRemovals, RemovedKey} from '../types'

export interface Operation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  from?: string
  path: string
  value?: unknown
}

export type PatchGenerator = <T>(changes: ChangeSet<T>, pathBase?: string) => Operation[]
