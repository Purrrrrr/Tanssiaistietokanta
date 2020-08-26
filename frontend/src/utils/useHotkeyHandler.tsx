import {isInputTag} from './useOnKeydown';
import getEvent2string from 'key-event-to-string';
import {useCallback, useMemo} from 'react';

const event2string = getEvent2string({joinWith: '+'});

export function useHotkeyHandler(...actions) {
  const keyMap = useMemo(() => toKeyMap(actions), [actions]);
  return useCallback(
    (event) => {
      const {target} = event;
      if (isInputTag(target)) return;
      const key = event2string(event).toLowerCase();
      const action = keyMap[key];
      if (action) {
        action(event);
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [keyMap],
  );
}

function toKeyMap(actions) {
  const keyMap = {};
  for (const {action, keys = [], key} of actions) {
    if (key) keyMap[key] = action;
    keys.forEach(key => keyMap[key] = action);
  }
  return keyMap;
}

export function bind(keys, action) {
  if (typeof(keys) === 'string') {
    return {key: keys, action};
  } else {
    return {keys, action};
  }
}
