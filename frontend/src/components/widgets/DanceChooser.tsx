import { useId } from 'react'

import {Dance} from 'types'

import {filterDances, useCreateDance, useDances} from 'services/dances'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs'
import {useT} from 'i18n'

interface DanceChooserProps {
  value: Dance | null,
  excludeFromSearch?: Dance[],
  onChange: (dance: Dance | null) => unknown,
  readOnly?: boolean
  hasConflict?: boolean
  emptyText?: string,
  allowEmpty?: boolean,
  placeholder?: string,
}

export function DanceChooser({
  value, onChange, allowEmpty, emptyText, excludeFromSearch, placeholder,
}: DanceChooserProps) {
  const t = useT('components.danceChooser')
  const [dances] = useDances()
  const [createDance] = useCreateDance()
  const id = useId()

  const items = excludeFromSearch
    ? dances.filter((dance: Dance) => dance._id === value?._id || !excludeFromSearch.some(excluded => excluded._id === dance._id))
    : dances
  const getItems = (query: string) => {
    const danceList = filterDances(items, query)
    const showCreateDance = query.trim().length > 0
      && !dances.some(dance => danceNameEquals(dance, query))
    const extraItems : DanceChooserOption[] = []
    if (allowEmpty) extraItems.push(null)
    if (showCreateDance) extraItems.push({ __typename: 'createDance', name: query.trim() })

    return extraItems.length > 0
      ? [...danceList, ...extraItems]
      : danceList
  }

  const chooseOrCreateDance = (created: DanceChooserOption) => {
    if (created?.__typename === 'createDance') {
      createDance({dance: {name: created.name}}).then(response => {
        if (!response?.data) {
          return
        }
        onChange(response.data.createDance as Dance)
      })
    } else if ((allowEmpty && created === null) || created?.__typename === 'Dance') {
      onChange(created)
    }
  }
  return <AutocompleteInput<DanceChooserOption>
    containerClassname=""
    placeholder={placeholder ?? t('searchDance')}
    id={id}
    items={getItems}
    value={value}
    onChange={chooseOrCreateDance}
    itemToString={item => item?.name ?? ''}
    itemRenderer={item => {
      if (item === null) return emptyText ?? t('emptyDancePlaceholder')
      if (item.__typename === 'createDance') return `${t('createDance')}: ${item.name}`
      return item.name
    }}
  />
}

type DanceChooserOption = Dance | CreateDance | null
interface CreateDance {
 __typename: 'createDance'
  name: string
}

function danceNameEquals(a: Dance, name: string) {
  return a.name.trim().toLowerCase() === name.trim().toLowerCase()
}
