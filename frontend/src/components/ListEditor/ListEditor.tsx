import React, {useCallback} from 'react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

import {ListEditorContext, ListEditorContextType, useListEditorContextValue, useListEditorContext} from './context';
import {objectId} from "./objectId";


/** Create a drag and drop list from items with the specified component
 *
 * Props:
 * items: The items to create a list from
 * onChange: a change handler that receives a changed items list
 * children: The list items, by default renders a ListEditorItems component with the supplied props
 */
type ListEditorProps = Omit<ListEditorItemsProps, 'component'> & {
  items: any[],
  onChange: (v: any[]) => any,
  className?: string,
  helperClass?: string,
  useDragHandle?: boolean
} & (
  {children: React.ReactNode, component?: undefined} | {children?: undefined | null, component: any}
)

export function ListEditor({items, children, component, onChange, className, helperClass, useDragHandle, ...props} : ListEditorProps) {
  function onSortEnd({oldIndex, newIndex}) {
    onChange(arrayMove(items, oldIndex, newIndex));
  }
  const context = useListEditorContextValue(items, onChange);

  return <ListEditorContext.Provider value={context}>
    <SortableList distance={5} onSortEnd={onSortEnd}
      className={className} helperClass={helperClass}
      useDragHandle={useDragHandle}
    >
      {children ?? <ListEditorItems component={component} {...props} />}
    </SortableList>
  </ListEditorContext.Provider>;
}

interface ListEditorItemsProps {
  itemWrapper?: string | React.JSXElementConstructor<any>,
  noWrapper?: boolean,
  component: any,
}

export function ListEditorItems({itemWrapper = "div", noWrapper, component} : ListEditorItemsProps) {
  const {items, actions} = useListEditorContext();

  return <>
    {items.map((item, index) =>
      <SortableItem key={objectId(item)} index={index} item={item} items={items}
        itemIndex={index} actions={actions}
        component={component} wrapper={noWrapper ? null : itemWrapper}
      />
    )}
  </>;
}

interface SortableItemProps {
  component?: any,
  wrapper?: any,
  items: any[],
  item: any,
  itemIndex: number,
  actions: ListEditorContextType["actions"]
}

const SortableList = SortableContainer(props => <div {...props} />);
const SortableItem = SortableElement<SortableItemProps>(React.memo(
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
