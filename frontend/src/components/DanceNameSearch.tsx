import React, {useCallback, useState} from 'react'
import {Input} from 'libraries/forms2'
import {searchWikiPages} from 'libraries/danceWiki'
import {useDelayedEffect} from 'utils/useDelayedEffect'

export function DanceNameSearch({value, onChange}) {
  const [suggestions, setSuggestions] = useState([])
  useDelayedEffect(70, 
    useCallback(
      () => searchWikiPages(value).then(setSuggestions), [value]
    )
  )

  return <>
    <Input id="danceSearch" value={value} onChange={onChange} list="dances" inline />
    <datalist id="dances">
      {suggestions.map(suggestion => <option value={suggestion} key={suggestion} />)}
    </datalist>
  </>
}
