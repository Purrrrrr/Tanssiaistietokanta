import {createContext, useContext} from 'react';
import produce from 'immer'
import {objectId, setObjectId} from "./objectId";

export const ListEditorContext = createContext();

export function getListEditorContext(items, onChange) {
  function addItem(item) {
    onChange([...items, item]);
  }
  function setItem(index, item) {
    onChange(produce(items, (draft) => {
      draft[index] = item;
      setObjectId(item, objectId(items[index]));
    }));
  }
  function removeItem(index) {
    onChange(produce(items, (draft) => { draft.splice(index, 1); }));
  }
  return {items, addItem, removeItem, setItem};
}

export function useListEditorContext() {
  return useContext(ListEditorContext);
}

export function useAddListItem() {
  return useContext(ListEditorContext).addItem;
}
