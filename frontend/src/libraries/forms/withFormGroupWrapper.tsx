import React, {useMemo} from 'react';
import {FormGroup} from "libraries/ui";

export interface FormGroupWrappedProps {
  id?: string
  label?: string,
  labelInfo?: string,
  helperText?: string,
  inline?: boolean,
}

export function withFormGroupWrapper<P extends {id?: string}>(Component: React.ComponentType<P>) {
  return ({label, id: maybeId, labelInfo, inline, helperText, ...props} : FormGroupWrappedProps & P ) => {
    const id = useStableId(maybeId, label);

    if (label || labelInfo || helperText) {
      return <FormGroup inline={inline} label={label} labelFor={id} labelInfo={labelInfo} helperText={helperText}>
        <Component id={id} {...props as P} />
      </FormGroup>
    }

    return <Component id={id} {...props as P} />;
  }
}

function useStableId(maybeId, label ?: string) {
  return useMemo(() => maybeId ?? generateId(label), [maybeId, label]);
}

let i = 0;
function generateId(label) {
  if (typeof(label) === "string") {
    return "form-element-"+label.replace(/[^a-zA-Z-]/g, '_')+"-"+(++i);
  }
  return 'form-element-'+(++i);
}
