import { useCallback, useMemo } from 'react'
import { Autocomplete, TParams, tr } from 'talkr'

import { DeepCommonStructure, PrefixPath, Translator } from './types'

import { useLocale } from './context'

export { TranslationProvider, useLocale } from './context'
export { useFormatDate, useFormatDateTime, useFormatDuration, useFormatTime } from './dateTime'
export type { KeyForPath, PrefixPath, Translator } from './types'

export interface TranlationSystem<Translations> {
  useT: <P extends PrefixPath<Translations> | ''>(prefix: P) => Translator<Translations, P>
  useTranslation: (prefix: Autocomplete<Translations>, params?: TParams) => string
  T: (props: { msg: Autocomplete<Translations> }) => React.ReactNode
}

export function makeTranslator<TranslationRecord extends Record<string, unknown>>(
  translations: TranslationRecord,
): TranlationSystem<DeepCommonStructure<TranslationRecord[keyof TranslationRecord]>> {
  return { useT, useTranslation, T }

  function useT(prefix: string): (key: string, params?: TParams) => string {
    const translator = useTranslator()

    return useMemo(() => {
      if (prefix === '') return translator

      return (key, params) => {
        return translator(`${prefix}.${key}`, params)
      }
    }, [translator, prefix])
  }

  function T({ msg }: { msg: string }): React.ReactNode {
    return useTranslation(msg) as unknown as React.ReactNode
  }
  function useTranslation(key: string, params?: TParams): string {
    return useTranslator()(key, params)
  }

  function useTranslator() {
    const locale = useLocale()

    return useCallback(
      (key: string, params?: TParams) => tr({ locale, languages: translations, defaultLanguage: locale }, key, params),
      [locale],
    )
  }
}
