import * as L from 'partial.lenses';

import {createContext, useContext} from 'react';
import {objectId, setObjectId} from "./objectId";

export const ListEditorContext = createContext();

export function getListEditorContext(items, onChange) {
  function addItem(item) {
    onChange([...items, item]);
  }
  function setItem(index, item) {
    setObjectId(item, objectId(items[index]));
    onChange(L.set(L.index(index), item, items));
  }
  function removeItem(index) {
    onChange(L.remove(L.index(index), items));
  }
  return {items, addItem, removeItem, setItem};
}

export function useListEditorContext() {
  return useContext(ListEditorContext);
}

export function useAddListItem() {
  return useContext(ListEditorContext).addItem;
}
