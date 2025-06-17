import { FieldContainerProps } from './types'

import {FormGroup} from 'libraries/ui'

import { useFieldStyle } from '../context'
import { HiddenLabel } from './HiddenLabel'

export function FieldContainer(props: FieldContainerProps) {
  const {
    labelFor, containerClassName, label, labelInfo, helperText, children, conflictElement
  } = props
  const { inline, labelStyle } = useFieldStyle(props)
  const formGroupId = `${labelFor}--formgroup`

  if (labelStyle === 'hidden') {
    const Container = inline ? 'span' : 'div'
    return <Container className={containerClassName} id={formGroupId}>
      <HiddenLabel labelFor={labelFor} label={label} labelInfo={labelInfo} />
      {conflictElement}
      {children}
      {helperText}
    </Container>
  }
  const helperTextId = `${labelFor}--helperText`

  return <FormGroup
    className={containerClassName}
    id={formGroupId}
    labelStyle={labelStyle}
    inline={inline}
    labelFor={labelFor}
    labelInfo={labelInfo}
    helperText={<span id={helperTextId}>{helperText}</span>}
    label={label}
    subLabel={conflictElement}
    intent={conflictElement !== undefined ? 'danger' : undefined}
  >
    {children}
  </FormGroup>
}
