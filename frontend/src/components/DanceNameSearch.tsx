import {useCallback} from 'react'

import { NewValue } from 'libraries/forms/types'

import { useSearchWikiTitles } from 'services/dancewiki'

import {Input} from 'libraries/forms'
import {useDelayedEffect} from 'utils/useDelayedEffect'

export function DanceNameSearch({id, value, onChange}: {id: string, value: string | null, onChange: (changed: NewValue<string>) => unknown}) {
  const [search, suggestions] = useSearchWikiTitles()
  useDelayedEffect(70,
    useCallback(
      () => {
        if (value && value.length > 1) search(value)
      },
      [search, value]
    )
  )

  return <>
    <Input id={id} value={value} onChange={onChange} list="dances" inline />
    <datalist id="dances">
      {((value && value.length > 1) ? suggestions : []).map(suggestion => <option value={suggestion.name} key={suggestion.name} />)}
    </datalist>
  </>
}
