import {useEffect} from "react";

export function useOnKeydown(onKeydown, key) {
  useEffect(() => {
    function onPress(event) {
      if (isInputTag(event.target)) return;
      if (key && event.key !== key) return;

      if (typeof(onKeydown) === 'object') {
        if (onKeydown[event.key]) onKeydown[event.key](event);
      } else {
        onKeydown(event);
      }
    }

    document.addEventListener("keydown", onPress, false);
    return () => document.removeEventListener("keydown", onPress, false);
  }, [onKeydown, key])
}

const inputTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
function isInputTag({tagName}) {
  return inputTags.includes(tagName);
}
