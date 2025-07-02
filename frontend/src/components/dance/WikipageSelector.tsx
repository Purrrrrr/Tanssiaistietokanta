import { useId } from 'react'

import { useSearchWikiTitles } from 'services/dancewiki'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs'
import {useT} from 'i18n'


interface WikipageSelectorProps {
  value: string | null,
  onChange: (value: string | null) => unknown,
  readOnly?: boolean
  emptyText?: string,
  placeholder?: string,
}

export function WikipageSelector({ value, onChange, readOnly, placeholder }: WikipageSelectorProps) {
  const t = useT('components.danceChooser')
  const id = useId()
  const [search] = useSearchWikiTitles()

  const getItems = (searchStr: string) => {
    return search(searchStr)
  }

  return <AutocompleteInput<string | null>
    placeholder={placeholder ?? t('searchDance')}
    id={id}
    items={getItems}
    value={value}
    onChange={onChange}
    readOnly={readOnly}
  />
}
