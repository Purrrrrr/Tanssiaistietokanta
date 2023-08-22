import { Autocomplete } from 'talkr'

export type NoEmptyTranslations<T> = T extends object
  ? {[K in keyof T]: NoEmptyTranslations<T[K]>}
  : T extends ''
    ? never
    : T

export type PrefixPath<T> = (T extends object
  ? ('' | {
    [K in Exclude<keyof T, symbol>]: `${K}${KeyPrefix<PrefixPath<T[K]>>}`
  }[Exclude<keyof T, symbol>])
  : ''
) extends infer D ? Extract<D, string> : never
type KeyPrefix<T extends string> = T extends '' ? '' : `.${T}`

export type KeyForPath<Path extends string, T> = Path extends ''
  ? Autocomplete<T>
  : Path extends keyof T
    ? Autocomplete<T[Path]>
    : Path extends `${infer Prefix extends Exclude<keyof T, symbol>}.${infer Rest}`
      ? KeyForPath<Rest, T[Prefix]>
      : never
