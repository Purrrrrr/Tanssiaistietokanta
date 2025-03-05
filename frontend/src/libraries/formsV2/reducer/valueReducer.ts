import * as L from 'partial.lenses'

import { ValueAction } from './types'
import { toArrayPath } from '../types'

export function valueReducer<Data>(value: Data, action: ValueAction<Data>): Data {
  switch (action.type) {
    case 'EXTERNAL_CHANGE':
      return action.value
    case 'CHANGE':
      return L.set(toArrayPath(action.path), action.value, value)
    case 'APPLY':
      return L.modify(toArrayPath(action.path), action.modifier, value)
  }
}
