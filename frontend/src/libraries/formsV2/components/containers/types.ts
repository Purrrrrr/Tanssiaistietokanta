import type { LabelStyle } from '@/libraries/ui/form/containers/types'

export interface FieldStyleContextProps {
  inline: boolean
  labelStyle: LabelStyle
}

export interface CommonContainerProps extends Partial<FieldStyleContextProps>, LabelProps { }

export interface LabelProps {
  label: string
  labelInfo?: string
}
