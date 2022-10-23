import React, {useCallback, useMemo} from 'react'

import {dancePropertyLabels, usePatchDance, WritableDanceProperty} from 'services/dances'

import {ClickToEdit, ClickToEditMarkdown} from 'libraries/forms2'
import useAutosavingState, {makePartial} from 'utils/useAutosavingState'

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
  const [dance, setDance] = useAutosavingState<Partial<Dance>, Partial<Dance>>(partialDance, patch, makePartial)

  const onChange = (value) => {
    setDance({
      ...dance,
      [property]: value,
    })
  }
  const label = dancePropertyLabels[property]

  if (!danceInDatabase?._id) return <>...</>

  const editorType = props['type']

  if (editorType === 'markdown') {
    return <ClickToEditMarkdown id={property} value={dance[property]} onChange={onChange} aria-label={label} inline={inline} />
  }

  return <ClickToEdit id={property} className="editableDanceProperty"
    inline={inline}
    value={dance[property]} onChange={onChange}
    aria-label={label}
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  />
}

