import { useCallback, useEffect, useId, useState } from 'react'

import { type ExternalFieldContainerProps, FieldContainer } from './components/FieldContainer'
import type { FieldInputComponent, OmitInputProps } from './components/inputs'
import { useFormContext } from './context'
import { change, setValidationResult } from './reducer'
import type { PathFor, ValidationProps } from './types'
import { validate } from './utils/validation'

/* TODO:
 *
 * input field components
 * working wrapper
 * list editor
 * conflict handling
 * Translator into form -> auto translated labels
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

export function Field<Input, Output extends Input, Extra extends object>({path, label, component: C, required, schema, ...extra}: FieldProps<Input, Output, Extra>) {
  const id = useId()
  const errorId = `${id}-error`
  const { value, onChange } = useFieldValueProps<Input, Output>(path, { required, schema })

  return <FieldContainer label={label} id="" error={{errors: [path]}} errorId={errorId} labelStyle="above">
    <C id={id} value={value} onChange={onChange} {...extra as Extra} />
  </FieldContainer>
}

function useFieldValueProps<Input, Output extends Input, Data = unknown>(path: PathFor<Data>, validation: ValidationProps) {
  const id = `${path}:${useId()}`
  const { getValueAt, dispatch, subscribe } = useFormContext()
  const [value, setValue] = useState(() => getValueAt<Input>(path))

  useEffect(
    () => subscribe(() => setValue(getValueAt(path))),
    [subscribe, path, getValueAt]
  )
  useEffect(
    () => {
      validate(validation, value).then(errors => dispatch(setValidationResult(id, errors)))
      return () => dispatch(setValidationResult(id, []))
    },
    [id, dispatch, value, validation]
  )

  const onChange = useCallback((value: Output) => {
    setValue(value)
    dispatch(change(path, value))
  }, [dispatch, path])
  return { value, onChange }
}
