import React from 'react';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import produce from 'immer'
import {guid} from "../utils/guid";
//import {Card} from "@blueprintjs/core";

export function ListEditor({items, onChange, children}) {
  function onSortEnd({oldIndex, newIndex}) {
    onChange(produce(items, (draft) => {
      const [item] = draft.splice(oldIndex, 1);
      draft.splice(newIndex, 0, item);
    }));
  }

  return <SortableList distance={5}
    items={items} children={children}
    onSortEnd={onSortEnd} onChange={onChange} />;
}

const SortableItem = SortableElement(({children, ...props}) =>
  <div tabIndex={0}>{children(props)}</div>
);

const SortableList = SortableContainer(({items, onChange, children}) => {
  function setItem(index, item) {
    onChange(produce(items, (draft) => { draft[index] = item; }));
  }
  function removeItem(index) {
    onChange(produce(items, (draft) => { draft.splice(index, 1); }));
  }

  return <div>
    {items.map((value, index) =>
      <SortableItem key={value.id || objectId(value)} index={index} item={value} children={children}
        onChange={(newItem) => setItem(index, newItem)} onRemove={() => removeItem(index)} />
      )}
  </div>;
});

const objectIdMap = new WeakMap();

function objectId(object){
  if (!objectIdMap.has(object)) {
    objectIdMap.set(object,guid());
  }
  return objectIdMap.get(object);
}
