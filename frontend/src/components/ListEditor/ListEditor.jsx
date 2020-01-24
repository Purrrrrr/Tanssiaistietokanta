import React from 'react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

import {ListEditorContext, getListEditorContext, useListEditorContext} from './context';
import {objectId} from "./objectId";


/** Create a drag and drop list from items with the specified component
 *
 * Props:
 * items: The items to create a list from
 * onChange: a change handler that receives a changed items list
 * children: The list items, by default renders a ListEditorItems component with the supplied props
 */

export function ListEditor({items, onChange, children, ...props}) {
  function onSortEnd({oldIndex, newIndex}) {
    onChange(arrayMove(items, oldIndex, newIndex));
  }
  const context = getListEditorContext(items, onChange);

  return <ListEditorContext.Provider value={context}>
    <SortableList distance={5} onSortEnd={onSortEnd}>
      {children ?? <ListEditorItems {...props} />}
    </SortableList>
  </ListEditorContext.Provider>;
}

export function ListEditorItems({itemWrapper, component}) {
  const {items, setItem, removeItem} = useListEditorContext();

  return items.map((item, index) =>
    <SortableItem key={objectId(item)} index={index} item={item}
    component={component} element={itemWrapper}
    onChange={(newItem) => setItem(index, newItem)} onRemove={() => removeItem(index)} />
  );
}

const SortableList = SortableContainer("div");
const SortableItem = SortableElement(({component, element, ...props}) => {
  const C = component;
  const Wrapper = element ?? "div";
  return <Wrapper tabIndex={0}><C {...props} /></Wrapper>;
});
