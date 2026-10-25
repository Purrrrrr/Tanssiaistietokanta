import { FieldContainerProps } from './types'

import { FormGroup } from '@/libraries/ui/form/containers/FormGroup'

export function FieldContainer(props: FieldContainerProps) {
  const { labelFor, containerClassName, children, ...rest } = props
  const formGroupId = `${labelFor}--formgroup`

  return <FormGroup
    className={containerClassName}
    id={formGroupId}
    labelFor={labelFor}
    {...rest}
  >
    {children}
  </FormGroup>
}
