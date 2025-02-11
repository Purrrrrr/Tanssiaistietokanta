import { useCallback, useEffect, useId, useState, useSyncExternalStore } from 'react'

import { type ExternalBareFieldContainerProps, type ExternalFieldContainerProps, BareFieldContainer, FieldContainer } from './components/FieldContainer'
import type { FieldInputComponent, OmitInputProps } from './components/inputs'
import { useFormContext } from './context'
import { change, setValidationResult } from './reducer'
import type { PathFor, ValidationProps } from './types'
import { validate } from './utils/validation'

/* TODO:
 *
 * FieldSet component
 *   wrapper?: none | fieldset
 * working wrapper
 *  always use <label>
 *  error-reference
 *  input id?
 *  read only mode
 *  inline
 * list editor
 *   no wrapper
 * fieldset wrapper?
 * a11y-announcement element for list editor and such
 * input field components
 * translations
 * conflict handling
 *
 * DONE:
 * reducer logic, types etc.
 * validation
 *
 */

export type FieldProps<Input, Output extends Input, Extra extends object>  = {
  path: PathFor<Input>
  component: FieldInputComponent<Input, Output, Extra>
} & OmitInputProps<Extra> & ExternalFieldContainerProps & ValidationProps

export function Field<Input, Output extends Input, Extra extends object>({path, containerClassName, label, labelStyle, labelInfo, helperText, component: C, required, schema, ...extra}: FieldProps<Input, Output, Extra>) {
  const id = useId()
  const { inputProps, containerProps } = useFieldValueProps<Input, Output>(path, { required, schema })

  return <FieldContainer
    label={label}
    labelFor={id}
    labelStyle={labelStyle}
    labelInfo={labelInfo}
    helperText={helperText}
    containerClassName={containerClassName}
    {...containerProps}
  >
    <C id={id} {...inputProps} {...extra as Extra} />
  </FieldContainer>
}


export type UnwrappedFieldProps<Input, Output extends Input, Extra extends object>  = {
  path: PathFor<Input>
  component: FieldInputComponent<Input, Output, Extra>
} & OmitInputProps<Extra> & ExternalBareFieldContainerProps & ValidationProps

export function UnwrappedField<Input, Output extends Input, Extra extends object>({path, label, component: C, required, schema, ...extra}: UnwrappedFieldProps<Input, Output, Extra>) {
  const id = useId()
  const { inputProps, containerProps } = useFieldValueProps<Input, Output>(path, { required, schema })

  return <BareFieldContainer {...containerProps} label={label} labelFor={id}>
    <C id={id} {...inputProps} {...extra as Extra} />
  </BareFieldContainer>
}


function useFieldValueProps<Input, Output extends Input, Data = unknown>(path: PathFor<Data>, validation: ValidationProps) {
  const id = `${path}:${useId()}`
  const errorId = `${id}-error`
  const { getState, getValueAt, dispatch, subscribe, subscribeTo } = useFormContext()
  const [value, setValue] = useState(() => getValueAt<Input>(path))
  const error = useSyncExternalStore(subscribeTo(path), () => getState().errors[id])

  useEffect(
    () => subscribe(() => setValue(getValueAt(path)), path),
    [subscribe, path, getValueAt]
  )
  useEffect(
    () => {
      validate(validation, value).then(errors => dispatch(setValidationResult(path, id, errors)))
      return () => dispatch(setValidationResult(path, id, []))
    },
    [path, id, dispatch, value, validation]
  )

  const onChange = useCallback((value: Output) => {
    setValue(value)
    dispatch(change(path, value))
  }, [dispatch, path])

  const inputProps = {
    value, onChange,
  }
  const containerProps = {
    error, errorId,
  }

  return { inputProps, containerProps }
}
