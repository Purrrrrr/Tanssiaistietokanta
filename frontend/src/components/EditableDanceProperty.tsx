import React, {useCallback, useMemo} from 'react'

import {usePatchDance, WritableDanceProperty} from 'services/dances'

import {ClickToEdit, ClickToEditMarkdown, patchStrategy, useAutosavingState} from 'libraries/forms'
import { useTranslation } from 'i18n'

import {Dance} from 'types'

import './EditableDanceProperty.sass'

type ValidProperty = Exclude<WritableDanceProperty, 'duration' | 'instructions'>

interface EditableDancePropertyProps {
  dance: Dance
  property: ValidProperty
  addText: string
  inline?: boolean
  type?: 'multiline' | 'markdown'
}

export function EditableDanceProperty({dance: danceInDatabase, inline, property, addText, ...props} : EditableDancePropertyProps) {
  const [patchDance] = usePatchDance()
  const patch = useCallback(
    (dance) => patchDance({ id: danceInDatabase._id, dance }),
    [danceInDatabase._id, patchDance]
  )
  const partialDance = useMemo(() => ({[property]: danceInDatabase[property]}), [property, danceInDatabase])
  const {value: dance, onChange: setDance, state} = useAutosavingState<Partial<Dance>, Partial<Dance>>(partialDance, patch, patchStrategy.partial)

  const onChange = (value) => {
    setDance({
      ...dance,
      [property]: value,
    })
  }
  const label = useTranslation(`domain.dance.${property}`)

  if (!danceInDatabase?._id) return <>...</>

  const editorType = props['type']

  if (editorType === 'markdown') {
    return <ClickToEditMarkdown
      id={property}
      syncState={state}
      value={dance[property]}
      onChange={onChange}
      aria-label={label}
      inline={inline} />
  }

  return <ClickToEdit
    id={property}
    className="editableDanceProperty"
    syncState={state}
    inline={inline}
    value={dance[property]}
    onChange={onChange}
    aria-label={label}
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  />
}

