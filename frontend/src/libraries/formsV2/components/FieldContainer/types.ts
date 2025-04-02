export interface FieldStyleContextProps {
  inline: boolean
  labelStyle: LabelStyle
}

export interface FieldContainerProps extends ExternalFieldContainerProps {
  children?: React.ReactNode
  //TODO: implement this
  conflictElement?: React.ReactElement
  labelFor: string
}

export interface ExternalFieldContainerProps {
  containerClassName?: string
  inline?: boolean
  labelStyle?: LabelStyle
  label: string
  labelInfo?: string
  helperText?: string
}

export interface BareFieldContainerProps extends ExternalBareFieldContainerProps {
  children?: React.ReactNode
  //TODO: implement this
  conflictElement?: React.ReactElement
  labelFor: string
}

export interface ExternalBareFieldContainerProps {
  label?: string
  labelInfo?: string
  helperText?: string
}

type LabelStyle = 'beside' | 'above' | 'hidden'
