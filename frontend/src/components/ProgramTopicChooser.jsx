import React from 'react';
import {Icon, Classes} from "@blueprintjs/core";

import {TypedAutosuggest} from './Autosuggest';
import {useDances, filterDances} from '../services/dances';
import {makeTranslate} from '../utils/translate';

import './ProgramTopicChooser.sass';

const t = makeTranslate({
  DANCE: 'Tanssi',
  HEADER: 'Otsikko',
  TEXT: 'Muu tieto'
});

export function ProgramTopicChooser({value, onChange}) {
  const [dances] = useDances();
  const type = (value && value.type) || "TEXT";

  return <div className="programTopicChooser" style={{display: "inline-flex", alignItems: "center"}}>
    <span className="typeTitle">
      {t(type)}
    </span>
    <TypedAutosuggest
      getSuggestions={value => getSuggestions(dances, value)}
      selected={value}
      setSelected={onChange}
      textToSelection={(text) => type === "DANCE" ?
          {type: "TEXT", name: text} :
          {type, name: text}
      }
      renderSuggestion={(suggestion) => showSuggestion(suggestion, value)}
      renderInputComponent={TopicInput}
      inputProps={{leftIcon: topicTypeIcons[type]}}
    />
  </div>;
}

function getSuggestions(dances, search) {
  if (search.trim() === '') return [];

  const foundDances = filterDances(dances, search);

  return [
    {title: t('DANCE'), items: foundDances.map(dance => ({type: "DANCE", name: dance.name, dance}))},
    {title: t('HEADER'), items: [{type: "HEADER", name: search}]},
    {title: t('TEXT'), items: [{type: "TEXT", name: search}]}
  ].filter(s => s.items.length);
}

function showSuggestion(suggestion, selected) {
  const isSelected = selected &&
    suggestion.type === selected.type &&
    selected.name === suggestion.name;
  return <>
    {isSelected && <Icon icon={'small-tick'}/>}
    {suggestion.name}
  </>;
}

/* This whole thing is a workaround for the limitations of react-autosuggest */
function TopicInput({leftIcon, ref, ...props}) {
  return <div className={Classes.INPUT_GROUP}>
    <Icon icon={leftIcon} />
    <input
      {...props}
      className={Classes.INPUT}
      ref={ref}
    />
  </div>;
}

const topicTypeIcons = {
  HEADER: 'numbered-list',
  TEXT: 'font',
  DANCE: 'music'
}
