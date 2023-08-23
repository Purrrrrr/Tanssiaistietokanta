import { useMemo } from 'react'
import { TParams, tr, useT as useBareT } from 'talkr'

import { KeyForPath, NoEmptyTranslations, PrefixPath } from './types'

import { fi } from './fi'

export * from './dateTime'
export { Talkr as TranslationContext } from 'talkr'

export const translations = {
  fi: fi satisfies NoEmptyTranslations<typeof fi>
}

type Translations = typeof fi
type Prefix = PrefixPath<Translations>
type PrefixedKey<P extends string> = KeyForPath<P, Translations>

export type Translator<P extends Prefix = ''> = (key: PrefixedKey<P>, params?: TParams) => string

export function useT<P extends Prefix | ''>(
  ...prefixes: P[]
): Translator<P>
{
  const context = useBareT()

  return useMemo(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.locale, ...prefixes])
}

export function T({msg} : {msg: PrefixedKey<''>}): JSX.Element {
  return useTranslation(msg) as unknown as JSX.Element
}
export function useTranslation(key: PrefixedKey<''>): string {
  return useBareT().T(key)
}

export const useLocalization : () => Pick<ReturnType<typeof useBareT>, 'locale' | 'setLocale'> = useBareT
