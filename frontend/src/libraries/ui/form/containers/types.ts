import { type Errors } from '../ErrorMessage'

export interface ErrorStateContainerProps {
  errors?: Errors | null
  errorId?: string
  conflictElement?: React.ReactNode
  children?: React.ReactNode
}

export interface FieldStyleContextProps {
  inline: boolean
  labelStyle: LabelStyle
}

export interface LabelProps extends Partial<FieldStyleContextProps> {
  label: string
  labelInfo?: string
}

export type LabelStyle = 'beside' | 'above' | 'hidden'
