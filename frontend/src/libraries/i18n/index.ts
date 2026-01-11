import { useMemo } from 'react'
import { Autocomplete, Talkr, TParams, TProps, tr, useT as useBareT } from 'talkr'

import { PrefixPath, Translator } from './types'

import { DateLike, useFormatDate, useFormatDateTime, useFormatDuration, useFormatTime } from './dateTime'

export type { PrefixPath, Translator } from './types'

export interface TranlationSystem<Translations> {
  useT: <P extends PrefixPath<Translations> | ''>(prefix: P) => Translator<Translations, P>
  useTranslation: (prefix: Autocomplete<Translations>, params?: TParams) => string
  T: (props: { msg: Autocomplete<Translations> }) => React.ReactNode
  useLocalization: typeof useLocalization
  TranslationContext: (props: TProps & { languages: Record<string, Translations> }) => React.ReactNode
  useFormatDate: () => (d: DateLike) => string
  useFormatDateTime: () => (d: DateLike) => string
  useFormatTime: () => (d: DateLike) => string
  useFormatDuration: () => (seconds: number) => string
}

export function makeTranslator<Translations>(): TranlationSystem<Translations> {
  return {
    useT,
    useTranslation,
    T,
    useLocalization,
    TranslationContext: Talkr,
    useFormatDate,
    useFormatDateTime,
    useFormatTime,
    useFormatDuration,
  }
}

function useT(prefix: string): (key: string, params?: TParams) => string {
  const context = useBareT()

  return useMemo(() => {
    if (prefix === '') return context.T
    const { locale, languages, defaultLanguage } = context

    return (key, params) => {
      return tr({ locale, languages, defaultLanguage }, `${prefix}.${key}`, params)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.locale, prefix])
}

function T({ msg }: { msg: string }): React.ReactNode {
  return useTranslation(msg) as unknown as React.ReactNode
}
function useTranslation(key: string, params?: TParams): string {
  return useBareT().T(key, params)
}

const useLocalization: () => Pick<ReturnType<typeof useBareT>, 'locale' | 'setLocale'> = useBareT
