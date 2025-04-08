import { CommonContainerProps } from '../types'

export interface FieldContainerProps extends ExternalFieldContainerProps {
  children?: React.ReactNode
  //TODO: implement this
  conflictElement?: React.ReactElement
  labelFor: string
}

export interface ExternalFieldContainerProps extends CommonContainerProps {
  containerClassName?: string
  helperText?: string
}
