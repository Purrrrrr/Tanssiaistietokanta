import { Autocomplete, TParams } from 'talkr'

export type DeepCommonStructure<U> = {
  [K in CommonKeys<U>]:
    ValueOf<U, K> extends object
      ? DeepCommonStructure<ValueOf<U, K>>
      : ValueOf<U, K>;
}

type CommonKeys<U> = {
  [K in keyof U]-?:
    U extends Record<K, unknown> ? K : never
}[keyof U]

type ValueOf<U, K extends PropertyKey> =
  U extends Record<K, infer V> ? V : never

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
