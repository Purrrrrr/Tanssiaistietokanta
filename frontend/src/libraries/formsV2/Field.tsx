import { useCallback, useEffect, useId, useState, useSyncExternalStore } from 'react'

import type { Labelable, PathFor, ValidationProps } from './types'

import { type ExternalBareFieldContainerProps, type ExternalFieldContainerProps, BareFieldContainer, FieldContainer } from './components/FieldContainer'
import type { FieldInputComponent, FieldInputComponentProps, OmitInputProps } from './components/inputs'
import { useFormContext } from './context'
import { useRunValidation } from './hooks'
import { change } from './reducer'

export type FieldProps<Output extends Input, Extra, Input> =
  CommonFieldProps<Output, Extra, Input> & ExternalFieldContainerProps

export type UnwrappedFieldProps<Output extends Input, Extra, Input> =
  CommonFieldProps<Output, Extra, Input> & ExternalBareFieldContainerProps

export type SelfLabeledFieldProps<Output extends Input, Extra extends Labelable, Input> = {
  label: string
} & CommonFieldProps<Output, Extra, Input> & ExternalBareFieldContainerProps

type CommonFieldProps<Output extends Input, Extra, Input> = ValidationProps & OmitInputProps<Extra> & {
  component: FieldInputComponent<Output, Extra, Input>
  path: PathFor<Input>
}

export function Field<Output extends Input, Extra, Input>({path, containerClassName, label, labelStyle, labelInfo, helperText, component: C, required, schema, ...extra}: FieldProps<Output, Extra, Input>) {
  const { inputProps, containerProps } = useFieldValueProps<Output, Input>(path, { required, schema })

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


export function UnwrappedField<Output extends Input, Extra, Input>({path, label, component: C, required, schema, ...extra}: UnwrappedFieldProps<Output, Extra, Input>) {
  const { inputProps, containerProps } = useFieldValueProps<Output, Input>(path, { required, schema })

  return <BareFieldContainer {...containerProps} label={label}>
    <C {...inputProps} {...extra as Extra} />
  </BareFieldContainer>
}

export function SelfLabeledField<Output extends Input, Extra extends Labelable, Input>({path, label, component: C, required, schema, ...extra}: SelfLabeledFieldProps<Output, Extra, Input>) {
  const { inputProps, containerProps } = useFieldValueProps<Output, Input>(path, { required, schema })

  return <BareFieldContainer {...containerProps}>
    <C {...inputProps} {...extra as unknown as Extra} label={label} />
  </BareFieldContainer>
}

function useFieldValueProps<Output extends Input, Input, Data = unknown>(path: PathFor<Data>, validation: ValidationProps) {
  const id = `${path}:${useId()}`
  const errorId = `${id}-error`
  const { readOnly, getState, getValueAt, dispatch, subscribe, subscribeTo } = useFormContext()
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
