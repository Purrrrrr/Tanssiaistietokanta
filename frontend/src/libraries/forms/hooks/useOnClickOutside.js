import {useEffect} from "react";

export function useOnClickOutside(ref, callback) {
  useEffect(() => {
    if (!callback) return;
    function onPress(event) {
      const element = ref.current;
      if (!element) return;
      if (element.contains(event.target)) return;
      callback(event);
    }

    document.addEventListener("mousedown", onPress, false);
    return () => document.removeEventListener("mousedown", onPress, false);
  }, [ref, callback])
}
