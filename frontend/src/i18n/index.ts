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

export function useT<P extends Prefix>(
  prefix: P | '' = ''
): Translator<P>
{
  const context = useBareT()

  return useMemo(() => {
    if (prefix === '') return context.T
    const { locale, languages, defaultLanguage } = context

    return (key, params) => {
      return tr({ locale, languages, defaultLanguage }, `${prefix}.${key}`, params)
    }
  }, [context.locale, prefix])
}

export function T({msg} : {msg: PrefixedKey<''>}): JSX.Element {
  return useTranslation(msg) as unknown as JSX.Element
}
export function useTranslation(key: PrefixedKey<''>): string {
  return useBareT().T(key)
}

export const useLocalization : () => Pick<ReturnType<typeof useBareT>, 'locale' | 'setLocale'> = useBareT
