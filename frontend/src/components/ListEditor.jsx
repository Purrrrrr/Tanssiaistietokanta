import React from 'react';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import produce from 'immer'
import {objectId, setObjectId} from "utils/objectId";
//import {Card} from "@blueprintjs/core";

/** Create a drag and drop list from items with the specified component
 * 
 * Props:
 * items: The items to create a list from
 * onChange: a change handler that receives a changed items list
 * component: A component or function that displays each item. Receives the props item, onChange and onRemove
 */
export function ListEditor({items, onChange, component}) {
  function onSortEnd({oldIndex, newIndex}) {
    onChange(produce(items, (draft) => {
      const [item] = draft.splice(oldIndex, 1);
      draft.splice(newIndex, 0, item);
    }));
  }

  return <SortableList distance={5}
    items={items} component={component}
    onSortEnd={onSortEnd} onChange={onChange} />;
}

const SortableList = SortableContainer(({items, onChange, component}) => {
  function setItem(index, item) {
    onChange(produce(items, (draft) => {
      draft[index] = item;
      setObjectId(item, objectId(items[index]));
    }));
  }
  function removeItem(index) {
    onChange(produce(items, (draft) => { draft.splice(index, 1); }));
  }

  return <div>
    {items.map((value, index) =>
      <SortableItem key={value.id || objectId(value)} index={index} item={value}
        component={component}
        onChange={(newItem) => setItem(index, newItem)} onRemove={() => removeItem(index)} />
      )}
  </div>;
});

const SortableItem = SortableElement(({component, ...props}) => {
  const C = component;
  return <div tabIndex={0}><C {...props} /></div>;
}
);

