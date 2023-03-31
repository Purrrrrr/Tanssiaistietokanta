export type { ID } from '../types'

export interface Operation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  from?: string
  path: string
  value?: unknown
}

export type PatchGenerator = <T>(original: T, changed: T, pathBase?: string) => Operation[]
