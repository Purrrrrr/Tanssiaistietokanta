import { ReactNode } from 'react'

import { ValidationProps } from '../validation'
import { TypedStringPath } from './path'

export interface FieldPropsWithoutComponent<T, V> extends UserGivenFieldContainerProps, ValidationProps {
  path: TypedStringPath<V, T>
}

export interface UserGivenFieldContainerProps extends LabelTexts {
  containerClassName?: string
  inline?: boolean
  labelStyle?: LabelStyle
}

export interface LabelTexts {
  label: string
  helperText?: ReactNode
  labelInfo?: string
}

export type LabelStyle = 'beside' | 'above' | 'hidden' | 'hidden-nowrapper'
