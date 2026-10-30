import { useId } from 'react'

import { DanceListItem, Workshop } from '@/types'
import { FieldInputComponent, FieldInputComponentProps, Nullable } from '@/libraries/ui/form/inputs/types'

import { filterDances, useCreateDance, useDances } from '@/services/dances'

import { canCreateUniqueItemFromQuery } from '@/libraries/common/listSearch'
import { AutocompleteInput } from '@/libraries/formsV2/components/inputs'
import { CssClass } from '@/libraries/ui/classes'
import { asNonNullableInput } from '@/libraries/ui/form/inputs/asNonNullableInput'
import { DanceCategoryTag } from '@/components/dance/DanceCategoryTag'
import { DanceIdSet } from '@/components/event/EventProgramForm/eventMetadata'
import { WorkshopTag } from '@/components/workshops/WorkshopTag'
import { useT } from '@/i18n'

export type DanceChooserItem = Omit<DanceListItem, 'events'>
type DanceChooserInput = Nullable<Pick<DanceChooserItem, '_id'>>
type DanceChooserOutput =
  (
    DanceChooserItem & {
      formationDiagrams: [] // Add fake data to satisfy the type of some fields that expect it
    }
  ) | null

export interface DanceChooserProps extends FieldInputComponentProps<DanceChooserOutput, DanceChooserInput> {
  excludeFromSearch?: Pick<DanceChooserItem, '_id'>[]
  emptyText?: string
  allowEmpty?: boolean
  placeholder?: string
  workshops?: Workshop[]
  chosenDancesIds?: DanceIdSet
}

export const DanceChooser: FieldInputComponent<DanceChooserOutput, DanceChooserProps, DanceChooserInput> = function ({
  value, onChange, readOnly, allowEmpty, emptyText, excludeFromSearch, placeholder, workshops = [], chosenDancesIds = new Set(),
}: DanceChooserProps) {
  const t = useT('components.danceChooser')
  const [dances] = useDances()
  const [createDance] = useCreateDance()
  const id = useId()

  const items = excludeFromSearch
    ? dances.filter((dance: DanceChooserItem) => dance._id === value?._id || !excludeFromSearch.some(excluded => excluded._id === dance._id))
    : dances
  const dancesInWorkshops = workshops.flatMap(w => w.instances).flatMap(i => i.dances).map(d => d?._id)
  const getItems = (query: string) => {
    const danceList = filterDances(items, query)
    const showCreateDance = canCreateUniqueItemFromQuery(items, query, 'name')
    const extraItems: DanceChooserOption[] = []
    if (allowEmpty) extraItems.push(null)
    if (showCreateDance) extraItems.push({ __typename: 'createDance', name: query.trim() })
    const isWorkshopDance = (id: string) => !chosenDancesIds.has(id) && dancesInWorkshops.includes(id)
    const categories = [
      {
        title: t('categories.missingFromWorkshops'),
        items: danceList.filter(dance => isWorkshopDance(dance._id)),
      },
      {
        title: t('categories.dances'),
        items: danceList.filter(dance => !isWorkshopDance(dance._id)),
      },
      {
        title: t('categories.other'),
        items: extraItems,
      },
    ]
    return { categories }
  }

  const chooseOrCreateDance = (chosen: DanceChooserOption) => {
    if (chosen?.__typename === 'createDance') {
      createDance({ dance: { name: chosen.name } }).then(response => {
        if (!response?.data) {
          return
        }
        onChange(addFakeData(response.data.createDance as DanceChooserItem))
      })
    } else if ((allowEmpty && chosen === null) || chosen?.__typename === 'Dance') {
      onChange(chosen ? addFakeData(chosen) : null)
    }
  }

  return <AutocompleteInput<DanceChooserOption>
    placeholder={placeholder ?? t('searchDance')}
    id={id}
    items={getItems}
    value={dances.find(dance => dance._id === value?._id)}
    onChange={chooseOrCreateDance}
    readOnly={readOnly}
    inputRenderer={props => {
      const dance = dances.find(d => d._id === value?._id)
      const category = dance && getCategory(dance)
      const workshop = value && workshops.find(w => w.instances.some(i => i.dances?.some(d => d._id === value._id)))

      return <div className={'flex flex-wrap items-center grow ' + CssClass.inputBox}>
        <input className={CssClass.inputElement + ' grow'} {...props} />
        <span>
          {category && <DanceCategoryTag small {...category} />}
          {workshop && <WorkshopTag small tag={workshop.abbreviation ?? undefined} title={workshop.name} />}
        </span>
      </div>
    }}
    itemToString={item => item?.name ?? ''}
    itemRenderer={item => {
      if (item === null) return emptyText ?? t('emptyDancePlaceholder')
      if (item.__typename === 'createDance') return `${t('createDance')}: ${item.name}`

      const category = getCategory(item)
      return <div className="flex justify-between items-center grow">
        <span>{item.name}</span>
        {category && <DanceCategoryTag small {...category} />}
      </div>
    }}
  />
}

export const NonEmptyDanceChooser = asNonNullableInput(DanceChooser)

function getCategory(dance: DanceChooserItem) {
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

function addFakeData(dance: DanceChooserItem): DanceChooserOutput {
  if (!dance) return null
  return {
    ...dance,
    formationDiagrams: [],
  }
}

type DanceChooserOption = DanceChooserItem | CreateDance | null
interface CreateDance {
 __typename: 'createDance'
  name: string
}
