export * from './types/field'
export * from './types/fieldComponent'
export * from './types/path'

export type PartialWhen<Cond extends boolean, T> = Cond extends true ? Partial<T> : T
export type NoRequiredProperties<T extends object> = RequiredProperties<T> extends never ? true : false

type RequiredProperties<T extends object> = Exclude<{
  [K in keyof T]: T extends Record<K, T[K]>
  ? K
  : never
}[keyof T], undefined>

export type FormStrings = Record<keyof typeof formStringDefaults, string>
export const formStringDefaults = {
  hasConflicts: 'Kentässä on ristiriitoja',
  conflictButton: 'Selvitä ristiriidat',
  local: 'Omat muokkauksesi',
  server: 'Palvelimen versio',
  chooseThis: 'Valitse tämä versio',
}

export type Version = 'SERVER' | 'LOCAL'

export const Deleted = Symbol('deleted value')

export type ConflictMap<T> = Map<string, Conflict<unknown>>
export type Conflict<T> = ScalarConflict<T> | ArrayConflict<T>

export interface ScalarConflict<T> {
  type: 'scalar'
  local: T | typeof Deleted
  server: T | typeof Deleted
}

export interface ArrayConflict<T> {
  type: 'array'
}
