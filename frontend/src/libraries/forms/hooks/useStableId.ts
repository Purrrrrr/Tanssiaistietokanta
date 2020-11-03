import {useMemo} from 'react';

export function useStableId(maybeId ?: string, label ?: any) {
  return useMemo(() => maybeId ?? generateId(label), [maybeId, label]);
}

let i = 0;
function generateId(label : any) {
  if (typeof(label) === "string") {
    return "form-element-"+label.replace(/[^a-zA-Z-]/g, '_')+"-"+(++i);
  }
  return 'form-element-'+(++i);
}
