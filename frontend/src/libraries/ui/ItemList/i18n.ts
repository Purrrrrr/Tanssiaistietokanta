import { makeTranslator } from 'libraries/i18n'

const translations = {
  fi: {
    selectRow: 'Valitse rivi',
    sortBy: 'Lajittele',
  },
}

export const { useT, useTranslation } = makeTranslator(translations)
