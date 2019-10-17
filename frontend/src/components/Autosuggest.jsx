import React, {useState, useEffect} from 'react';
import ReactAutosuggest from 'react-autosuggest';

import './autosuggest.css';

export function Autosuggest({inputValue, onChange, onBlur, getSuggestions, inputProps, ...props}) {
  const [suggestions, setSuggestions] = useState([]);

  return <ReactAutosuggest
    suggestions={suggestions}
    onSuggestionsFetchRequested={({value}) => setSuggestions(getSuggestions(value))}
    onSuggestionsClearRequested={() => setSuggestions([])}
    inputProps={{
      ...inputProps,
      value: inputValue,
      onChange, onBlur
    }}
    {...props}
  />;

}

/** A multisectioned Autosuggest where all the suggestions have a type.
 * Handles the internal logic so we always get objects as suggestions
 * 
 * Props:
 * getSuggestions :: query => [SuggestionSection]
 * Given a query, retuns a list of suggestion sections
 *
 * selected: Suggestion
 * setSelected: Suggestion => void
 *
 * textToSelection: (String, Suggestion) => Suggestion
 * When freeform text is typed, what to do to the selected field.
 * Takes the text and the current selection as parameters
 * 
 * Types:
 * SuggestionSection = { title: String, items: [Suggestion] }
 * Suggestion = {type: String, name: string}
 */
export function TypedAutosuggest({selected, textToSelection, setSelected, ...props}) {
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (selected && selected.name !== search) setSearch(selected.name);
  }, [selected, search])

  return <Autosuggest
      multiSection
      renderSectionTitle={s => <p><strong>{s.title}</strong></p>}
      getSectionSuggestions={s => s.items}
      getSuggestionValue={({name}) => name || ""}
      inputValue={search}
      onChange={(e, {newValue, method}) => {
        setSearch(newValue)
        if (method === "type") {
          setSelected(textToSelection(newValue));
        }
      }}
      onSuggestionHighlighted={({suggestion}) =>
        suggestion && setSelected(suggestion)}
      onBlur={(e, {highlightedSuggestion}) =>
        highlightedSuggestion && setSelected(highlightedSuggestion) }
      {...props}
    />;

}
