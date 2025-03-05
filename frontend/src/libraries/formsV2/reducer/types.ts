import type { Errors, PathFor } from '../types'

export type Selection = [number, number] | null

export type FormAction<Data> = ValueAction<Data> | {
  type: 'SET_VALIDATION_RESULT'
  path: PathFor<Data>
  id: string
  errors: Errors
} | {
  type: 'FOCUS'
  path: PathFor<Data>
  selection: Selection
} | {
  type: 'BLUR'
} | {
  type: 'SELECT'
  path: PathFor<Data>
  selection: Selection
}

export type ValueAction<Data> = {
  type: 'EXTERNAL_CHANGE'
  value: Data
} | {
  type: 'CHANGE'
  path: PathFor<Data>
  value: unknown
} | {
  type: 'APPLY'
  path: PathFor<Data>
  modifier: (value: unknown) => unknown
}
