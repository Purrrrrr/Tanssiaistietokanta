import classNames from 'classnames'

import { type ErrorStateContainerProps, LabelProps } from './types'

import { useFieldStyleContext } from './context'
import { ErrorStateContainer } from './ErrorStateContainer'

import './Fieldset.css'

export interface FieldsetProps extends ErrorStateContainerProps, LabelProps, React.ComponentProps<'fieldset'> {
}

export function Fieldset({ errors, errorId, conflictElement, inline, labelStyle, label, labelInfo, className, children, ...rest }: FieldsetProps) {
  const fieldStyle = useFieldStyleContext({ inline, labelStyle })
  const labelVisible = fieldStyle.labelStyle !== 'hidden'
  const classes = classNames(
    className,
    fieldStyle.inline && 'inline-flex',
    labelVisible && 'form-fieldset bp5-form-group',
    fieldStyle.labelStyle === 'beside' && 'label-beside',
  )

  return <fieldset className={classes} {...rest}>
    <legend className={labelVisible ? 'bp5-label-' : 'sr-only'}>
      {label}{labelInfo && ` ${labelInfo}`}
    </legend>
    <ErrorStateContainer errors={errors} errorId={errorId} conflictElement={conflictElement}>
      {children}
    </ErrorStateContainer>
  </fieldset>
}
