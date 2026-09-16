import { makeTranslator } from '@/libraries/i18n'

const translations = {
  fi: {
    selectRow: 'Valitse rivi',
    sortBy: 'Lajittele',
    columnOptionsTitle: 'Lajittelun ja sarakkeiden asetukset',
    toggleColumnVisibility: 'Näytä/piilota sarake',
    openDetails: 'Avaa lisätiedot',
    closeDetails: 'Sulje lisätiedot',
  },
}

export const { useT, useTranslation } = makeTranslator(translations)
