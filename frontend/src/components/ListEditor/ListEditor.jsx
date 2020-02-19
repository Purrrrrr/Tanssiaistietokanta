import React, {useCallback} from 'react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

import {ListEditorContext, useListEditorContextValue, useListEditorContext} from './context';
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
  const context = useListEditorContextValue(items, onChange);

  return <ListEditorContext.Provider value={context}>
    <SortableList distance={5} onSortEnd={onSortEnd}>
      {children ?? <ListEditorItems {...props} />}
    </SortableList>
  </ListEditorContext.Provider>;
}

export function ListEditorItems({itemWrapper = "div", noWrapper, component}) {
  const {items, actions} = useListEditorContext();

  return items.map((item, index) =>
    <SortableItem key={objectId(item)} index={index} item={item}
      itemIndex={index} actions={actions}
      component={component} wrapper={noWrapper ? null : itemWrapper}
    />
  );
}



const SortableList = SortableContainer("div");
const SortableItem = SortableElement(React.memo(
  ({component, wrapper, actions, itemIndex, ...props}) => {
    const C = component;
    const callbacks = useActionCallbacks(actions, itemIndex);
    if (wrapper) {
      const Wrapper = wrapper;
      return <Wrapper tabIndex={0}><C {...callbacks} {...props} /></Wrapper>;
    } else {
      return <C tabIndex={0} {...callbacks} {...props} />;
    }
  }
));

function useActionCallbacks(actions, index) {
  const {moveDown, moveUp, setItem, removeItem} = actions;
  const onMoveDown = useCallback(() => moveDown(index), [moveDown, index]);
  const onMoveUp = useCallback(() => moveUp(index), [moveUp, index]);
  const onChange = useCallback((newItem) => setItem(index, newItem), [setItem, index]);
  const onRemove = useCallback(() => removeItem(index), [removeItem, index]);
  return {onMoveDown, onMoveUp, onRemove, onChange};
}
