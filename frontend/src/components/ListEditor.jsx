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
export function ListEditor({items, onChange, component, element, rowElement}) {
  function onSortEnd({oldIndex, newIndex}) {
    onChange(produce(items, (draft) => {
      const [item] = draft.splice(oldIndex, 1);
      draft.splice(newIndex, 0, item);
    }));
  }

  return <SortableList distance={5} element={element} rowElement={rowElement}
    items={items} component={component}
    onSortEnd={onSortEnd} onChange={onChange} />;
}

const SortableList = SortableContainer(({items, onChange, component, element, rowElement}) => {
  function setItem(index, item) {
    onChange(produce(items, (draft) => {
      draft[index] = item;
      setObjectId(item, objectId(items[index]));
    }));
  }
  function removeItem(index) {
    onChange(produce(items, (draft) => { draft.splice(index, 1); }));
  }

  const Wrapper = element ?? "div";

  return <Wrapper>
    {items.map((value, index) =>
      <SortableItem key={value.id || objectId(value)} index={index} item={value} itemIndex={index}
        component={component} element={rowElement}
        onChange={(newItem) => setItem(index, newItem)} onRemove={() => removeItem(index)} />
      )}
  </Wrapper>;
});

const SortableItem = SortableElement(({component, element, ...props}) => {
  const C = component;
  const Wrapper = element ?? "div";
  return <Wrapper tabIndex={0}><C {...props} /></Wrapper>;
}
);

