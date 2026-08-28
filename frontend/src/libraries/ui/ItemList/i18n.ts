import { makeTranslator } from 'libraries/i18n'

const translations = {
  fi: {
    selectRow: 'Valitse rivi',
    sortBy: 'Lajittele',
    toggleColumnVisibility: 'Näytä/piilota sarake',
  },
}

export const { useT, useTranslation } = makeTranslator(translations)
