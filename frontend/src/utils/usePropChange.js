import {useCallback} from 'react';
import * as L from 'partial.lenses';

export function usePropChange(prop, onChange) {
  return useCallback(
    arg => {
      typeof(arg) === 'function'
        ? onChange(L.modify(prop, arg))
        : onChange(val => L.set(prop, arg, val));
    },
    [prop, onChange]
  );

}
