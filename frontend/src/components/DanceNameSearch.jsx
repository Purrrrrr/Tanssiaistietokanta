import React, {useState, useEffect} from 'react';
import {Input} from "libraries/forms";
import {searchWikiPages} from 'libraries/danceWiki';

export function DanceNameSearch({value, onChange}) {
  const [suggestions, setSuggestions] = useState([]);
  useEffect(
    () => {
      let id = setTimeout(
        () => { searchWikiPages(value).then(setSuggestions); id = null; },
        70
      )
      return () => id && clearTimeout(id);
    },
    [value]
  )

  return <>
    <Input value={value} onChange={onChange} list="dances" />
    <datalist id="dances">
      {suggestions.map(suggestion => <option value={suggestion} key={suggestion} />)}
    </datalist>
  </>
}
