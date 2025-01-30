import type {Error} from './ErrorMessage'

export interface FieldStyleContextProps {
  inline: boolean
  labelStyle: LabelStyle
}

export interface FieldContainerProps extends ExternalFieldContainerProps {
  children?: React.ReactNode
  //TODO: implement this
  conflictElement?: React.ReactElement
  id: string
  error: Error | null
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
