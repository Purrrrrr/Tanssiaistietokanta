import { Autocomplete, TParams } from 'talkr'

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

export type Translator<T, P extends '' | PrefixPath<T> = ''> = (key: KeyForPath<P, T>, params?: TParams) => string
