import * as L from 'partial.lenses';

import {createContext, useContext, useMemo, useCallback, useRef} from 'react';
import {objectId, setObjectId} from "./objectId";

export interface ListEditorContextType {
  items: any[],
  actions: {
    addItem: (v: any) => any,
    removeItem: (i: number) => any,
    setItem: (i: number, v: any) => any,
    moveUp: (i: number) => any,
    moveDown: (i: number) => any,
  }
}

export const ListEditorContext = createContext<ListEditorContextType>({
  items: [],
  actions: {
    addItem: (v) => {},
    removeItem: (i) => {},
    setItem: (i, v) => {},
    moveUp: (i) => {},
    moveDown: (i) => {},
  }
});

export function useListEditorContext() {
  return useContext(ListEditorContext);
}
export function createListEditorContextValue(items, onChange) {
  const itemsRef = useRef();
  itemsRef.current = items;
  const updater = useCallback(mapper => onChange(mapper(itemsRef.current)), [onChange]);
  const actions = useMemo(() => callbacksForUpdater(updater), [updater]);
  return {items, actions};
}

function callbacksForUpdater(update) {
  function addItem(item) {
    update(L.set(L.append, item));
  }
  function setItem(index, item) {
    update(items => {
      const newVal = typeof(item) === 'function' ? item(items[index]) : item;
      setObjectId(newVal, objectId(items[index]));
      return L.set(L.index(index), newVal, items);
    });
  }
  function removeItem(index) {
    update(L.remove(L.index(index)));
  }
  function moveUp(index) {
    update(items => {
      if (index > 0 && index < items.length) {
        const newItems = [...items];
        newItems[index-1] = items[index];
        newItems[index] = items[index-1];
        return newItems;
      }
      return items;
    });
  }
  function moveDown(index) {
    moveUp(index+1);
  }
  return {addItem, removeItem, setItem, moveUp, moveDown};
}
