import { TParams, tr, useT as useBareT } from 'talkr'

import { KeyForPath, NoEmptyTranslations, PrefixPath } from './types'

import { fi } from './fi'

export { Talkr as TranslationContext } from 'talkr'

export const translations = {
  fi: fi satisfies NoEmptyTranslations<typeof fi>
}

type Translations = typeof fi
type Prefix = PrefixPath<Translations>
type PrefixedKey<P extends string> = KeyForPath<P, Translations>

export type Translator<P extends Prefix = ''> = (key: PrefixedKey<P>, params?: TParams) => string

export function useT<P extends Prefix>(
  ...prefixes: (P | '')[]
): Translator<P>
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
