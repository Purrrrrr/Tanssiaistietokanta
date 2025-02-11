import {FormGroup} from 'libraries/ui'

import { FieldContainerProps } from './types'

import { BareFieldContainer } from './BareFieldContainer'
import { useFieldStyle } from './context'

export function FieldContainer(props: FieldContainerProps) {
  const {
    labelFor, containerClassName, error, errorId, label, labelInfo, helperText, children, conflictElement
  } = props
  const { inline, labelStyle } = useFieldStyle(props)
  const formGroupId = `${labelFor}--formgroup`

  if (labelStyle === 'hidden') {
    const Container = inline ? 'span' : 'div'
    return <Container id={formGroupId}><BareFieldContainer {...props} /></Container>
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
    <BareFieldContainer labelFor="" children={children} error={error} errorId={errorId} />
  </FormGroup>
}
