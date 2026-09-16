import { makeTranslator } from '@/libraries/i18n'

export const commonTranslations = {
  fi: {
    emptySearch: 'Tyhjennä haku',
    actions: 'Toiminnot',
    search: 'Hae...',
    remove: 'Poista',
    delete: 'Poista',
    edit: 'Muokkaa',
    close: 'Sulje',
    closeEditor: 'Sulje muokkaus',
    cancel: 'Peruuta',
    choose: 'Valitse',
    save: 'Tallenna',
    move: 'Siirrä',
    operationFailed: 'Tietojen tallennus epäonnistui :(',
    subPages: 'Tämän sivun alasivut',
    loadingEditor: 'Ladataan lomaketta...',
    version: 'versio __version__',
  },
}

export const { useT: useCommonT, useTranslation: useCommonTranslation } = makeTranslator(commonTranslations)
