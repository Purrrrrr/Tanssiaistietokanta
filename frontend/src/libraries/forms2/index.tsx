import React from 'react';

type Path = string[]

interface FieldComponentProps<T> {
  value: T
  onChange: (t: T) => unknown
  hasConflict: boolean
  readOnly: boolean
  id: string
  "aria-described-by"?: string
  "aria-label"?: string
}

interface FieldProps<Value> {
  path: Path
  component: React.JSXElementConstructor<FieldComponentProps<Value>>
}

export function Field<T>({path, component: Component}: FieldProps<T>) {
  /* Wrapper: Formgroup or not, mandatory label */
  <div></div>

}


function useFormValue() {
}
