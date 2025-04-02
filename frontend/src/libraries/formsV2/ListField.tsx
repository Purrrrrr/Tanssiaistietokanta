import { useCallback, useEffect, useId, useState } from 'react'

import type { AnyType, FieldPath, ValidationProps } from './types'

import { type ExternalBareFieldContainerProps, BareFieldContainer } from './components/FieldContainer'
import type { FieldInputComponent, FieldInputComponentProps, OmitInputProps } from './components/inputs'
import { type ListItem, Repeater } from './components/Repeater'
import { useFormContext } from './context'
import { useRunValidation } from './hooks'
import { change } from './reducer'

export type ListFieldProps<Output extends Input, Extra, Input extends ListItem, Data = AnyType> = ValidationProps &
  ExternalBareFieldContainerProps &
  OmitInputProps<Extra> & {
    component: FieldInputComponent<Output, Extra, Input>
    path: FieldPath<Output[], Output[], Data>
  }

export function ListField<Output extends Input, Extra, Input extends ListItem, Data = AnyType>({path, label, component: C, required, schema, ...extra}: ListFieldProps<Output, Extra, Input, Data>) {
  const { value: values, onChange, inputProps, containerProps } = useFieldValueProps<Output[], Output[], Data>(path, { required, schema })

  return <BareFieldContainer {...containerProps} label={label}>
    <Repeater path={path}>
      {({ index }) =>
        <C
          {...inputProps}
          value={values[index]}
          onChange={(newItem: Output) => {
            const newVal = [...values]
            newVal[index] = newItem
            onChange(newVal)
          }}
          {...extra as Extra}
        />
      }
    </Repeater>
  </BareFieldContainer>
}

function useFieldValueProps<Output extends Input, Input, Data = unknown>(path: FieldPath<Input, Output, Data>, validation: ValidationProps) {
  const id = `${path}:${useId()}`
  const errorId = `${id}-error`
  const { readOnly, getValueAt, dispatch, subscribe } = useFormContext<Data>()
  const [value, setValue] = useState(() => getValueAt<Input>(path))
  const error = useRunValidation(path, id, value, validation)

  useEffect(
    () => subscribe(() => setValue(getValueAt(path))),
    [subscribe, path, getValueAt]
  )

  const onChange = useCallback((value: Output) => {
    setValue(value)
    dispatch(change(path, value))
  }, [dispatch, path])

  const inputProps = {
    value, onChange, id, readOnly, 'aria-describedby': errorId,
  } satisfies FieldInputComponentProps<Output, Input>
  const containerProps = {
    error, errorId, labelFor: id,
  }

  return {
    value, onChange, readOnly,
    inputProps,
    containerProps
  }
}
