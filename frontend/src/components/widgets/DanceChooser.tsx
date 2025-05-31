import {useEffect, useState} from 'react'
import {Suggest} from '@blueprintjs/select'

import {Dance} from 'types'

import {filterDances, useCreateDance, useDances} from 'services/dances'

import {CssClass, MenuItem} from 'libraries/ui'
import {useT} from 'i18n'

interface DanceChooserProps {
  value: Dance | null,
  excludeFromSearch?: Dance[],
  onChange: (dance: Dance | null, e: React.ChangeEvent<HTMLElement>) => unknown,
  readOnly?: boolean
  hasConflict?: boolean
  emptyText?: string,
  allowEmpty?: boolean,
  placeholder?: string,
  onBlur?: (e: React.FocusEvent) => unknown,
}

interface EmptyDancePlaceholder extends Dance {
  _id: '',
  empty: true
}
interface NewDancePlaceholder extends Dance {
  _id: 'new',
}

export function DanceChooser({hasConflict, value, onChange, excludeFromSearch, allowEmpty = false, emptyText, onBlur, placeholder, readOnly, ...props} : DanceChooserProps) {
  const t = useT('components.danceChooser')
  const [query, setQuery] = useState(value ? value.name : '')
  const [dances] = useDances()
  const [createDance] = useCreateDance()

  useEffect(() => {
    setQuery(value?.name ?? '')
  }, [value?.name])

  const items = excludeFromSearch
    ? dances.filter((dance: Dance) => dance._id === value?._id || !excludeFromSearch.some(excluded => excluded._id === dance._id))
    : dances

  const showCreateDance = query.trim().length > 0
    && !dances.some(dance => danceNameEquals(dance, query))

  return <Suggest<(Dance)|EmptyDancePlaceholder>
    items={items}
    inputValueRenderer={dance => dance.name ?? ''}
    itemDisabled={dance => {
      if (isPlaceholder(dance)) return !allowEmpty
      return false
    }}
    itemRenderer={renderDance}
    itemsEqual="_id"
    inputProps={{onBlur, placeholder: placeholder ?? t('searchDance'), onKeyDown: cancelEnter, intent: hasConflict ? 'danger' : undefined, ...props}}
    itemListPredicate={(query, items) => {
      const dances = filterDances(items, query)
      return [...dances, emptyDancePlaceholder(emptyText)]
    }}
    createNewItemFromQuery={newDancePlaceholder}
    createNewItemRenderer={showCreateDance ? renderCreateItem : undefined}
    query={query}
    onQueryChange={setQuery}
    selectedItem={value}
    onItemSelect={(item, e) => {
      if (isNewDance(item)) {
        createDance({dance: {name: item.name}}).then(response => {
          if (!response?.data) {
            return
          }
          onChange(response.data.createDance as Dance, e as React.ChangeEvent<HTMLElement>)
          setQuery(item.name ?? '')
        })
      } else if (isPlaceholder(item)) {
        onChange(null, e as React.ChangeEvent<HTMLElement>)
        setQuery('')
      } else {
        onChange(item, e as React.ChangeEvent<HTMLElement>)
        setQuery(item.name ?? '')
      }
    }}
    disabled={readOnly}
    popoverProps={{minimal: true}}
    fill
  />

  function emptyDancePlaceholder(text: string | undefined): EmptyDancePlaceholder {
    return {__typename: 'Dance', _id: '', name: text ?? t('emptyDancePlaceholder'), empty: true}
  }

  function renderCreateItem(queryString: string, active: boolean, handleClick) {
    return <MenuItem
      active={active}
      onClick={handleClick}
      text={t('createDance') + ': ' + queryString}
    />
  }
}

function cancelEnter(e) {
  if (e.key === 'Enter') {
    //Stop keyboard selection events from triggering form submits or other actions
    e.stopPropagation()
    e.preventDefault()
  }
}

function danceNameEquals(a: Dance, name: string) {
  return a.name.trim().toLowerCase() === name.trim().toLowerCase()
}


function isPlaceholder(object: Dance | EmptyDancePlaceholder): object is EmptyDancePlaceholder {
  return 'empty' in object
}

function newDancePlaceholder(text: string): NewDancePlaceholder {
  return {__typename: 'Dance', _id: 'new', name: text}
}

function isNewDance(object: Dance | EmptyDancePlaceholder | NewDancePlaceholder): object is NewDancePlaceholder {
  return object._id === 'new'
}

function renderDance (dance, { handleClick, modifiers }) {
  return <MenuItem
    active={modifiers.active}
    disabled={modifiers.disabled}
    key={dance._id ?? 'empty'}
    onClick={handleClick}
    text={dance.name}
    textClassName={(dance.empty && !modifiers.active) ? CssClass.textDisabled : undefined}
  />
}
