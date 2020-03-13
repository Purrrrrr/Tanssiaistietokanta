import React, {useMemo} from 'react';
import {FormGroup} from "@blueprintjs/core";

export function withFormGroupWrapper(Component) {
  return ({label, id: maybeId, labelInfo, inline, helperText, ...props}) => {
    const id = useStableId(maybeId, label);

    if (label || labelInfo || helperText) {
      return <FormGroup inline={inline} label={label} labelFor={id} labelInfo={labelInfo} helperText={helperText}>
        <Component id={id} {...props} />
      </FormGroup>
    }

    return <Component id={id} {...props} />;

  }
}

function useStableId(maybeId, label) {
  return useMemo(() => maybeId ?? generateId(label), [maybeId, label]);
}

let i = 0;
function generateId(label) {
  if (typeof(label) === "string") {
    return "form-element-"+label.replace(/[^a-zA-Z-]/g, '_')+"-"+(++i);
  }
  return 'form-element-'+(++i);
}
