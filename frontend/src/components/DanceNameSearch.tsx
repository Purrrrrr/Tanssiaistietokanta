import React, {useState} from 'react';
import {Input} from "libraries/forms";
import {searchWikiPages} from 'libraries/danceWiki';
import {useDelayedEffect} from 'utils/useDelayedEffect';

export function DanceNameSearch({value, onChange}) {
  const [suggestions, setSuggestions] = useState([]);
  useDelayedEffect(70, () => searchWikiPages(value).then(setSuggestions), [value]);

  return <>
    <Input value={value} onChange={onChange} list="dances" label="Tanssin nimi" labelStyle="hidden" />
    <datalist id="dances">
      {suggestions.map(suggestion => <option value={suggestion} key={suggestion} />)}
    </datalist>
  </>
}
