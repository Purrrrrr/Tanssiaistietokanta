import React, {useState} from 'react'
import {MenuItem} from '@blueprintjs/core'
import {Suggest} from '@blueprintjs/select'

import {filterDances, useCreateDance, useDances} from 'services/dances'

import {CssClass} from 'libraries/ui'
import {makeTranslate} from 'utils/translate'

import {Dance} from 'types'

interface DanceChooserProps {
  value: Dance | null,
  excludeFromSearch?: Dance[],
  onChange: (dance: Dance | null, e: React.ChangeEvent<HTMLElement>) => unknown,
  readOnly?: boolean
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

const t = makeTranslate({
  searchDance: 'Etsi tanssia...',
})

export function DanceChooser({value, onChange, excludeFromSearch, allowEmpty = false, emptyText, onBlur, placeholder, readOnly, ...props} : DanceChooserProps) {
  const [query, setQuery] = useState(value ? value.name : '')
  const [dances] = useDances()
  const [createDance] = useCreateDance()

  const items = excludeFromSearch
    ? dances.filter((dance: Dance) => dance === value || !excludeFromSearch.some(excluded => excluded._id === dance._id))
    : dances

  return <Suggest<Dance|EmptyDancePlaceholder>
    items={items}
    inputValueRenderer={dance => dance.name ?? ''}
    itemRenderer={renderDance}
    itemsEqual="_id"
    inputProps={{onBlur, placeholder: placeholder ?? t`searchDance`, onKeyDown: cancelEnter, ...props}}
    itemListPredicate={(query, items) => {
      const dances = filterDances(items, query)
      return allowEmpty && query.trim() === '' ? [emptyDancePlaceholder(emptyText), ...dances] : dances
    }}
    createNewItemFromQuery={newDancePlaceholder}
    createNewItemRenderer={renderCreateItem}
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
}

function cancelEnter(e) {
  if (e.key === 'Enter') {
    //Stop keyboard selection events from triggering form submits or other actions
    e.stopPropagation()
    e.preventDefault()
  }
}

function emptyDancePlaceholder(text?: string): EmptyDancePlaceholder {
  return {__typename: 'Dance', _id: '', name: text ?? '-', empty: true}
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

function renderCreateItem(queryString,  active, handleClick) {
  return <MenuItem
    active={active}
    onClick={handleClick}
    text={'Luo uusi tanssi: '+queryString}
  />
}

