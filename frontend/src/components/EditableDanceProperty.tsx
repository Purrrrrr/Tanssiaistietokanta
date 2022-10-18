import React, {useMemo, useCallback} from 'react'
import {Dance} from 'types/Dance'
import useAutosavingState, {makePartial} from 'utils/useAutosavingState'
import {usePatchDance, WritableDanceProperty, dancePropertyLabels} from 'services/dances'
import {ClickToEdit, ClickToEditMarkdown} from 'libraries/forms2'

import './EditableDanceProperty.sass'

type ValidProperty = Exclude<WritableDanceProperty, 'duration' | 'instructions'>

interface EditableDancePropertyProps {
  dance: any,
  property: ValidProperty,
  addText: string,
  type?: 'multiline' | 'markdown'
}

export function EditableDanceProperty({dance: danceInDatabase, property, addText, ...props} : EditableDancePropertyProps) {
  const [patchDance] = usePatchDance()
  const patch = useCallback(
    (dance) => patchDance({ _id: danceInDatabase._id, ...dance }),
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
    return <ClickToEditMarkdown id={property} value={dance[property]} onChange={onChange} aria-label={label} />
  }

  return <ClickToEdit id={property} className="editableDanceProperty"
    value={dance[property]} onChange={onChange}
    aria-label={label}
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  />
}

