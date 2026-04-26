import { KeyForPath, makeTranslator, PrefixPath, Translator as Tr } from 'libraries/i18n'

import { fi } from './fi'

export { useFormatDate, useFormatDateTime, useFormatDuration, useFormatTime } from 'libraries/i18n'

const translations = {
  fi,
}
type Translations = typeof fi
export type Translator<P extends PrefixPath<Translations> | ''> = Tr<Translations, P>
export type TranslationKey<P extends PrefixPath<Translations> | '' = ''> = KeyForPath<P, Translations>

export const { useT, useTranslation, T } = makeTranslator(translations)
