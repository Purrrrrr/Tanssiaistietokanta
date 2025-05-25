import { type ComponentType } from 'react'

import { SelectorProps } from './types'
import { FieldInputComponent } from '../types'

export function selectorWithType<T>(
  component: ComponentType<SelectorProps<T>>,
): FieldInputComponent<T, SelectorProps<T>, T> {
  return component as FieldInputComponent<T, SelectorProps<T>, T>
}
