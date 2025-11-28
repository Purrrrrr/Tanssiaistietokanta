import { makeTranslator, PrefixPath, Translator as Tr } from 'libraries/i18n'

import { fi } from './fi'

export const translations = {
  fi,
}
type Translations = typeof fi
export type Translator<P extends PrefixPath<Translations> | ''> = Tr<Translations, P>

export const {
  useT,
  useTranslation,
  T,
  useLocalization,
  TranslationContext,
  useFormatDate,
  useFormatDateTime,
  useFormatDuration,
} = makeTranslator<Translations>()
