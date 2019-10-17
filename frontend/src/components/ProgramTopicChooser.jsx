import React, {useState} from 'react';
import {Icon, Classes} from "@blueprintjs/core";

import {TypedAutosuggest} from './Autosuggest';
import {useDances, filterDances} from '../services/dances';

const strings = {
  dance: 'Tanssi',
  header: 'Otsikko',
  text: 'Muu tieto'
}
const t = k => strings[k];

export function ProgramTopicChooser({value, onChange}) {
  const [dances] = useDances();
  const type = (value && value.type) || "text";

  return <div style={{display: "inline-flex", alignItems: "center"}}>
    <span style={{marginRight: 5}}>
      {t(type)}
    </span>
    <TypedAutosuggest
      getSuggestions={value => getSuggestions(dances, value)}
      selected={value}
      setSelected={onChange}
      textToSelection={(text) => type === "dance" ?
          {type: "text", name: text} :
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
    {title: t('dance'), items: foundDances.map(dance => ({type: "dance", name: dance.name, dance}))},
    {title: t('header'), items: [{type: "header", name: search}]},
    {title: t('text'), items: [{type: "text", name: search}]}
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
  header: 'numbered-list',
  text: 'font',
  dance: 'music'
}
