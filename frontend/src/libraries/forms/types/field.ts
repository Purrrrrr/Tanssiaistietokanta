import { ReactNode } from 'react'

import type { LabelStyle } from '@/libraries/ui/form/containers/types'

import { ValidationProps } from '../validation'
import { TypedStringPath } from './path'

export interface FieldPropsWithoutComponent<T, V> extends UserGivenFieldContainerProps, ValidationProps {
  path: TypedStringPath<V, T>
}

export interface UserGivenFieldContainerProps extends LabelTexts {
  readOnly?: boolean
  containerClassName?: string
  inline?: boolean
  labelStyle?: LabelStyle | 'hidden-nowrapper'
}

export interface LabelTexts {
  label: string
  helperText?: ReactNode
  labelInfo?: string
}
