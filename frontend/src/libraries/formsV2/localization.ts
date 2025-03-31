import { get } from 'partial.lenses'

import { DataPath } from './types'

const defaultLocalizations = {
  moveItem: 'Siirrä',
  markdownEditor: {
    insertQRCode: 'Syötä QR-koodi',
    helpUrl: 'https://github.com/akx/markdown-cheatsheet-fi/blob/master/Markdown-Ohje.md',
    help: 'Ohjeita',
  },
  validationMessages: {
    required: '__fieldName__ on pakollinen',
    requiredList: 'Kentän __fieldName__ täytyy sisältää ainakin yksi arvo',
  },
}

type TranslationKey = DataPath<string, typeof defaultLocalizations>

//TODO: implement some good system
export const useFormTranslation = (key: TranslationKey) => {
  return get(key.split('.'), defaultLocalizations)
}
