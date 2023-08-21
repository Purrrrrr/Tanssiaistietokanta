import { Autocomplete, TParams, tr, useT as useBareT } from 'talkr'

import { fi } from './fi'

export { Talkr as TranslationContext } from 'talkr'

export const translations = {
  fi: fi satisfies NoEmptyTranslations<typeof fi>
}

type Translations = typeof fi

type NoEmptyTranslations<T> = T extends object
  ? {[K in keyof T]: NoEmptyTranslations<T[K]>}
  : T extends ''
    ? never
    : T

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
    ? Autocomplete<T[Path]>
    : Path extends `${infer Prefix extends Exclude<keyof T, symbol>}.${infer Rest}`
      ? KeyForPath<Rest, T[Prefix]>
      : never


export function useT<P extends Prefix>(
  ...prefixes: (P | '')[]
): (key: PrefixedKey<P>, params?: TParams) => string
{
  const context = useBareT()
  if (prefixes.length === 0) return context.T
  const { locale, languages, defaultLanguage } = context

  return (key, params) => {
    for (const pref of prefixes) {
      const fullKey = pref === '' ? key : `${pref}.${key}`
      const translation = tr({ locale, languages, defaultLanguage }, fullKey, params)
      if (translation !== '') return translation
    }
    return ''
  }
}

export const useLocalization : () => Pick<ReturnType<typeof useBareT>, 'locale' | 'setLocale'> = useBareT
