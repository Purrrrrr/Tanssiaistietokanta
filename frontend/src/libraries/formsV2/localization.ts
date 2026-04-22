import { get } from 'partial.lenses'

import { DataPath } from './types'

const defaultLocalizations = {
  moveItem: 'Siirrä',
  validationMessages: {
    required: '__fieldName__ on pakollinen',
    requiredList: 'Kentän __fieldName__ täytyy sisältää ainakin yksi arvo',
  },
  selector: {
    choose: 'Valitse __fieldName__',
    chosen: 'Valittuna nyt __value__',
    value: 'arvo',
  },
}

type TranslationKey = DataPath<string, typeof defaultLocalizations>

// TODO: implement some good system
export const useFormTranslation = (key: TranslationKey, substitutions?: Record<string, string>) => {
  const translation = get(key.split('.'), defaultLocalizations)

  if (!substitutions) {
    return translation
  }

  return Object.entries(substitutions)
    .reduce(
      (currentTranslation: string, [substitutionKey, substitution]) => currentTranslation.replace(`__${substitutionKey}__`, substitution),
      translation,
    )
}
