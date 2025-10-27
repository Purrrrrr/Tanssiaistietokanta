import { useMemo } from 'react'
import { Autocomplete, Talkr, TParams, TProps, tr, useT as useBareT } from 'talkr'

import { PrefixPath, Translator } from './types'

import { DateLike, useFormatDate, useFormatDateTime, useFormatTime } from './dateTime'

export type { PrefixPath, Translator } from './types'

export interface TranlationSystem<Translations> {
  useT: <P extends PrefixPath<Translations> | ''>(prefix: P) => Translator<Translations, P>
  useTranslation: (prefix: Autocomplete<Translations>) => string
  T: (props: { msg: Autocomplete<Translations> }) => JSX.Element
  useLocalization: typeof useLocalization
  TranslationContext: (props: TProps & { languages: Record<string, Translations> }) => JSX.Element
  useFormatDate: () => (d: DateLike) => string
  useFormatDateTime: () => (d: DateLike) => string
  useFormatTime: () => (d: DateLike) => string
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

function T({ msg }: { msg: string }): JSX.Element {
  return useTranslation(msg) as unknown as JSX.Element
}
function useTranslation(key: string): string {
  return useBareT().T(key)
}

const useLocalization: () => Pick<ReturnType<typeof useBareT>, 'locale' | 'setLocale'> = useBareT
