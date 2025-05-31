import { useCallback, useId } from 'react'

import type { AnyType, FieldPath, SpecializedFieldComponent } from '../types'

import { useFieldSubscription } from '../hooks/useFieldSubscription'
import { change } from '../reducer'
import { type ExternalFieldContainerProps, FieldContainer } from './containers/FieldContainer'
import type { FieldInputComponent, Nullable, OmitInputProps } from './inputs'
import { type ValidationProps, ValidationMessage } from './ValidationMessage'

export type RangeFieldProps<Output extends Input, Extra, Input, Data = AnyType> =
  ExternalFieldContainerProps & Omit<ValidationProps<Range<Input>>, 'required'> & OmitInputProps<Extra> & {
  component: FieldInputComponent<Range<Output>, Extra, Range<Input>>
  startPath: FieldPath<Input, Output, Data>
  endPath: FieldPath<Input, Output, Data>
}

export type Range<T> = [T, T]

export function RangeField<Output extends Input, Extra, Input, Data = AnyType>({
  containerClassName, inline, label, labelStyle, labelInfo, helperText, startPath, endPath, component: C, schema, ...extra
}: RangeFieldProps<Output, Extra, Input, Data>) {
  const id = useId()
  const errorId = `${id}-error`
  const inputProps = useFieldSubscription<Range<Output>, Range<Input>, Data>(
    useCallback((getValueAt) => [getValueAt(startPath), getValueAt(endPath)], [startPath, endPath]),
    useCallback((value, dispatch) => {
      dispatch(change(startPath, value[0]))
      dispatch(change(endPath, value[1]))
    }, [startPath, endPath]),
  )

  return <FieldContainer
    inline={inline}
    labelFor={id}
    label={label}
    labelStyle={labelStyle}
    labelInfo={labelInfo}
    helperText={helperText}
    containerClassName={containerClassName}
  >
    <C {...inputProps} id={id} aria-describedby={errorId} {...extra as Extra} />
    <ValidationMessage id={errorId} path={startPath} value={inputProps.value} schema={schema} />
  </FieldContainer>
}

export type RangeFieldComponent<Data, Output extends Input, Extra, Input = Nullable<Output>> =
  SpecializedFieldComponent<RangeFieldProps<Output, Extra, Input, Data>>

export function asRangeField<Output extends Input, Extra, Input, Data = AnyType>(
  c: FieldInputComponent<Range<Output>, Extra, Range<Input>>): RangeFieldComponent<Data, Output, Extra, Input> {
  return props => {
    return <RangeField {...props as RangeFieldProps<Output, Extra, Input, Data>} component={c} />
  }
}
