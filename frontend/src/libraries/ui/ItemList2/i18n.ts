import { makeTranslator } from 'libraries/i18n'

const translations = {
  fi: {
    sortBy: 'Lajittele',
  },
}

export const { useT, useTranslation } = makeTranslator(translations)
