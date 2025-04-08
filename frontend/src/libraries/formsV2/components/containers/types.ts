export interface FieldStyleContextProps {
  inline: boolean
  labelStyle: LabelStyle
}

export type LabelStyle = 'beside' | 'above' | 'hidden'

export interface CommonContainerProps extends Partial<FieldStyleContextProps>, LabelProps { }

export interface LabelProps {
  label: string
  labelInfo?: string
}
