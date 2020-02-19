import React, {useState} from 'react';
import {filterDances, useDances} from 'services/dances';

import { MenuItem } from "@blueprintjs/core";
import {Suggest} from "@blueprintjs/select";

export function DanceChooser({value, onChange, fill, onBlur}) {
  const [query, setQuery] = useState(value ? value.name : "");
  const [dances] = useDances();

  return <Suggest items={dances}
    inputValueRenderer={dance => dance.name}
    itemRenderer={renderDance}
    itemsEqual="_id"
    inputProps={{onBlur}}
    itemListPredicate={(query, items) => filterDances(items, query)}
    query={query}
    onChange={setQuery}
    selectedItem={value}
    onItemSelect={onChange}
    resetOnSelect
    popoverProps={{minimal: true}}
    fill={fill}
  />;
}

function renderDance (dance, { handleClick, modifiers }) {
  return <MenuItem
    active={modifiers.active}
    disabled={modifiers.disabled}
    key={dance._id}
    onClick={handleClick}
    text={dance.name}
  />;
};

