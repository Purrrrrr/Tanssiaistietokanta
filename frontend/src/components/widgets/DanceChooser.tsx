import React, {useState} from 'react';
import {filterDances, useDances} from 'services/dances';
import {Dance} from 'services/dances';
import {CssClass} from "libraries/ui";

import {MenuItem} from "@blueprintjs/core";
import {Suggest} from "@blueprintjs/select";

interface DanceChooserProps {
  value: Dance | null,
  onChange: (dance: Dance | null) => any,
  emptyText?: string,
  allowEmpty?: boolean,
  fill?: boolean,
  onBlur?: (e: React.FocusEvent) => any,
}

interface EmptyDancePlaceholder {
  _id: undefined,
  name: string,
  empty: true
}

export function DanceChooser({value, onChange, allowEmpty = false, emptyText, fill, onBlur} : DanceChooserProps) {
  const [query, setQuery] = useState(value ? value.name : "");
  const [dances] = useDances();

  return <Suggest<Dance|EmptyDancePlaceholder> items={dances}
    inputValueRenderer={dance => dance.name ?? ""}
    itemRenderer={renderDance}
    itemsEqual="_id"
    inputProps={{onBlur, onKeyDown: cancelEnter}}
    itemListPredicate={(query, items) => {
      const dances = filterDances(items, query);
      return allowEmpty && query.trim() === '' ? [emptyDancePlaceholder(emptyText), ...dances] : dances;
    }}
    query={query}
    onQueryChange={setQuery}
    selectedItem={value}
    onItemSelect={item => {
      if (isPlaceholder(item)) {
        onChange(null);
        setQuery("");
      } else {
        onChange(item)
        setQuery(item.name ?? "")
      }
    }}
    popoverProps={{minimal: true}}
    fill={fill}
  />;
}

function cancelEnter(e) {
  if (e.key === 'Enter') {
    //Stop keyboard selection events from triggering form submits or other actions
    e.stopPropagation();
    e.preventDefault();
  }
}

function emptyDancePlaceholder(text?: string) {
  return {name: text ?? "-", empty: true};
}

function isPlaceholder(object: any): object is EmptyDancePlaceholder {
    return object.empty;
}


function renderDance (dance, { handleClick, modifiers }) {
  return <MenuItem
    active={modifiers.active}
    disabled={modifiers.disabled}
    key={dance._id ?? "empty"}
    onClick={handleClick}
    text={dance.name}
    textClassName={(dance.empty && !modifiers.active) ? CssClass.textDisabled : undefined}
  />;
};

