import { lazy } from 'react'

import { SelectorProps } from './types'
import { FieldInputComponent } from '../types'

const FilterableSelect = lazy(() => import('./FilterableSelect'))
const RegularSelect = lazy(() => import('./RegularSelect'))

export interface SelectProps<T> extends SelectorProps<T> {
  filterable?: boolean
}

export function Select<T>({ filterable, ...props }: SelectProps<T>) {
  return filterable
    ? <FilterableSelect {...props} />
    : <RegularSelect {...props} />
}


export function selectWithType<T>(): FieldInputComponent<T, SelectProps<T>, T> {
  return Select as FieldInputComponent<T, SelectProps<T>, T>
}

Select.withType = selectWithType
