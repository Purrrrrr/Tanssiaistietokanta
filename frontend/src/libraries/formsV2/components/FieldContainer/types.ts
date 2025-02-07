import { Errors } from '../../types'

export interface FieldStyleContextProps {
  inline: boolean
  labelStyle: LabelStyle
}

export interface FieldContainerProps extends ExternalFieldContainerProps {
  children?: React.ReactNode
  //TODO: implement this
  conflictElement?: React.ReactElement
  id: string
  error?: Errors
  errorId: string
}

export interface ExternalFieldContainerProps {
  containerClassName?: string
  inline?: boolean
  labelStyle?: LabelStyle
  label: string
  helperText?: string
  labelInfo?: string
}

type LabelStyle = 'beside' | 'above' | 'hidden' | 'hidden-nowrapper';
