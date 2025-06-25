import { useId } from 'react'

import {Dance, Workshop} from 'types'

import {filterDances, useCreateDance, useDances} from 'services/dances'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs'
import { CssClass } from 'libraries/ui'
import { DanceIdSet } from 'components/event/EventProgramForm/eventMetadata'
import {useT} from 'i18n'

import { ColoredTag } from './ColoredTag'

interface DanceChooserProps {
  value: Dance | null,
  excludeFromSearch?: Dance[],
  onChange: (dance: Dance | null) => unknown,
  readOnly?: boolean
  hasConflict?: boolean
  emptyText?: string,
  allowEmpty?: boolean,
  placeholder?: string,
  workshops?: Workshop[]
  chosenDancesIds?: DanceIdSet
}

export function DanceChooser({
  value, onChange, allowEmpty, emptyText, excludeFromSearch, placeholder, workshops = [], chosenDancesIds = new Set(),
}: DanceChooserProps) {
  const t = useT('components.danceChooser')
  const [dances] = useDances()
  const [createDance] = useCreateDance()
  const id = useId()

  const items = excludeFromSearch
    ? dances.filter((dance: Dance) => dance._id === value?._id || !excludeFromSearch.some(excluded => excluded._id === dance._id))
    : dances
  const dancesInWorkshops = workshops.flatMap(w => w.instances).flatMap(i => i.dances).map(d => d?._id)
  const getItems = (query: string) => {
    const danceList = filterDances(items, query)
    const showCreateDance = query.trim().length > 0
      && !dances.some(dance => danceNameEquals(dance, query))
    const extraItems : DanceChooserOption[] = []
    if (allowEmpty) extraItems.push(null)
    if (showCreateDance) extraItems.push({ __typename: 'createDance', name: query.trim() })
    const isWorkshopDance = (id: string) => !chosenDancesIds.has(id) && dancesInWorkshops.includes(id)
    const categories = [
      {
        title: t('categories.missingFromWorkshops'),
        items: danceList.filter(dance => isWorkshopDance(dance._id))
      },
      {
        title: t('categories.dances'),
        items: danceList.filter(dance => !isWorkshopDance(dance._id))
      },
      {
        title: t('categories.other'),
        items: extraItems,
      },
    ]
    return { categories }
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
    placeholder={placeholder ?? t('searchDance')}
    id={id}
    items={getItems}
    value={value}
    onChange={chooseOrCreateDance}
    inputRenderer={props => {
      const dance = dances.find(d => d._id === value?._id)
      const category = dance && getCategory(dance)
      const workshop = dance && workshops.find(w => w.instances.some(i => i.dances?.some(d => d._id === dance._id)))

      return <div className="flex flex-wrap grow items-center">
        <input className={CssClass.input + ' grow'} {...props} />
        <span>
          {category && <ColoredTag small {...category} />}
          {workshop && <ColoredTag small title={workshop.name} />}
        </span>
      </div>
    }}
    itemToString={item => item?.name ?? ''}
    itemRenderer={item => {
      if (item === null) return emptyText ?? t('emptyDancePlaceholder')
      if (item.__typename === 'createDance') return `${t('createDance')}: ${item.name}`

      const category = getCategory(item)
      return <div className="flex grow items-center justify-between">
        <span>{item.name}</span>
        {category && <ColoredTag small {...category} />}
      </div>
    }}
  />
}

function getCategory(dance: Dance) {
  if (dance.category?.trim()) {
    return {
      title: dance.category,
      hashSource: dance.category,
    }
  }
  if (dance.wikipage?.categories?.length) {
    const guess = dance.wikipage?.categories[0]
    return {
      title: `${guess}?`,
      hashSource: guess,
    }
  }
  return null
}

type DanceChooserOption = Dance | CreateDance | null
interface CreateDance {
 __typename: 'createDance'
  name: string
}

function danceNameEquals(a: Dance, name: string) {
  return a.name.trim().toLowerCase() === name.trim().toLowerCase()
}
