import { useCallback, useEffect, useId, useState, useSyncExternalStore } from 'react'

import type { AnyType, FieldPath, Labelable, ValidationProps } from './types'

import { type ExternalBareFieldContainerProps, type ExternalFieldContainerProps, BareFieldContainer, FieldContainer } from './components/FieldContainer'
import type { FieldInputComponent, FieldInputComponentProps, OmitInputProps } from './components/inputs'
import { useFormContext } from './context'
import { useRunValidation } from './hooks'
import { change } from './reducer'

export type FieldProps<Output extends Input, Extra, Input, Data = AnyType> =
  CommonFieldProps<Output, Extra, Input, Data> & ExternalFieldContainerProps

export type UnwrappedFieldProps<Output extends Input, Extra, Input, Data = AnyType> =
  CommonFieldProps<Output, Extra, Input, Data> & ExternalBareFieldContainerProps

export type SelfLabeledFieldProps<Output extends Input, Extra extends Labelable, Input, Data = AnyType> =
  UnwrappedFieldProps<Output, Extra, Input, Data>

type CommonFieldProps<Output extends Input, Extra, Input, Data = AnyType> = ValidationProps & OmitInputProps<Extra> & {
  component: FieldInputComponent<Output, Extra, Input>
  path: FieldPath<Input, Output, Data>
}

export function Field<Output extends Input, Extra, Input, Data = AnyType>({path, containerClassName, label, labelStyle, labelInfo, helperText, component: C, required, schema, ...extra}: FieldProps<Output, Extra, Input, Data>) {
  const { inputProps, containerProps } = useFieldValueProps<Output, Input, Data>(path, { required, schema })

  return <FieldContainer
    label={label}
    labelStyle={labelStyle}
    labelInfo={labelInfo}
    helperText={helperText}
    containerClassName={containerClassName}
    {...containerProps}
  >
    <C {...inputProps} {...extra as Extra} />
  </FieldContainer>
}


export function UnwrappedField<Output extends Input, Extra, Input, Data = AnyType>({path, label, component: C, required, schema, ...extra}: UnwrappedFieldProps<Output, Extra, Input, Data>) {
  const { inputProps, containerProps } = useFieldValueProps<Output, Input, Data>(path, { required, schema })

  return <BareFieldContainer {...containerProps} label={label}>
    <C {...inputProps} {...extra as Extra} />
  </BareFieldContainer>
}

export function SelfLabeledField<Output extends Input, Extra extends Labelable, Input, Data = AnyType>({path, label, component: C, required, schema, ...extra}: SelfLabeledFieldProps<Output, Extra, Input, Data>) {
  const { inputProps, containerProps } = useFieldValueProps<Output, Input, Data>(path, { required, schema })

  return <BareFieldContainer {...containerProps}>
    <C {...inputProps} {...extra as unknown as Extra} label={label} />
  </BareFieldContainer>
}

function useFieldValueProps<Output extends Input, Input, Data = unknown>(path: FieldPath<Input, Output, Data>, validation: ValidationProps) {
  const id = `${path}:${useId()}`
  const errorId = `${id}-error`
  const { readOnly, getState, getValueAt, dispatch, subscribe, subscribeTo } = useFormContext<Data>()
  const [value, setValue] = useState(() => getValueAt<Input>(path))
  const error = useSyncExternalStore(subscribeTo(path), () => getState().errors[id])
  useRunValidation(path, id, value, validation)

  useEffect(
    () => subscribe(() => setValue(getValueAt(path)), path),
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

  return { inputProps, containerProps }
}
