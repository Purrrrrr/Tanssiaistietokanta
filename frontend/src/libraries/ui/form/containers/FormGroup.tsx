import { type ErrorStateContainerProps, LabelProps } from './types'

import { useFieldStyle } from '@/libraries/formsV2/components/containers/context'

import { FormGroup as FormGroupImpl } from '../../FormGroup'
import { ErrorStateContainer } from './ErrorStateContainer'

export interface FormGroupProps extends ErrorStateContainerProps, LabelProps, React.ComponentProps<'div'> {
  labelFor?: string
  helperText?: React.ReactNode
}

export function FormGroup({ errors, errorId, conflictElement, inline: i, labelStyle: ls, labelFor, label, labelInfo, helperText, children, ...rest }: FormGroupProps) {
  const { inline, labelStyle } = useFieldStyle({ inline: i, labelStyle: ls })

  if (labelStyle === 'hidden') {
    const Container = inline ? 'span' : 'div'
    return <Container {...rest}>
      <label htmlFor={labelFor} className="sr-only">
        {label}{labelInfo && ` ${labelInfo}`}
      </label>
      <ErrorStateContainer errors={errors} errorId={errorId} conflictElement={conflictElement}>
        {children}
      </ErrorStateContainer>
    </Container>
  }
  const helperTextId = `${labelFor}--helperText`

  return <FormGroupImpl
    labelStyle={labelStyle}
    inline={inline}
    labelFor={labelFor}
    labelInfo={labelInfo}
    helperText={<span id={helperTextId}>{helperText}</span>}
    label={label}
    subLabel={conflictElement}
    {...rest}
  >
    <ErrorStateContainer errors={errors} errorId={errorId}>
      {children}
    </ErrorStateContainer>
  </FormGroupImpl>
}
