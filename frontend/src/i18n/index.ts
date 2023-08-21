import { Autocomplete, TParams, tr, useT as useBareT } from 'talkr'

import { fi } from './fi'

export { Talkr as TranslationContext } from 'talkr'

export const translations = {fi}

type Translations = typeof fi

type Prefix = PrefixPath<Translations>
type PrefixedKey<P extends string> = KeyForPath<P, Translations>

type KeyPrefix<T extends string> = T extends '' ? '' : `.${T}`
type PrefixPath<T> = (T extends object
  ? ('' | {
    [K in Exclude<keyof T, symbol>]: `${K}${KeyPrefix<PrefixPath<T[K]>>}`
  }[Exclude<keyof T, symbol>])
  : ''
) extends infer D ? Extract<D, string> : never
type KeyForPath<Path extends string, T> = Path extends ''
  ? Autocomplete<T>
  : Path extends keyof T
    ? `${Path}${KeyPrefix<Autocomplete<T[Path]>>}`
    : Path extends `${infer Prefix extends Exclude<keyof T, symbol>}.${infer Rest}`
      ? `${Prefix}${KeyPrefix<KeyForPath<Rest, T[Prefix]>>}` extends infer D ? Extract<D, string> : never
      : never


export function useT<P extends Prefix>(
  prefix: P | '' = ''
): (key: PrefixedKey<P>, params?: TParams) => string
{
  const context = useBareT()
  if (prefix === '') return context.T
  const { locale, languages, defaultLanguage } = context

  return (key, params) => tr({ locale, languages, defaultLanguage }, prefix + '.' + key, params)
}

export const useLocalization : () => Pick<ReturnType<typeof useBareT>, 'locale' | 'setLocale'> = useBareT
