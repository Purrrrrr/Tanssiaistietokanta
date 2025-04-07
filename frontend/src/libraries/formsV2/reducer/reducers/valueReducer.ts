import { arrayMove } from '@dnd-kit/sortable'
import { get, modify, set } from 'partial.lenses'

import { ValueAction } from '../types'
import { toArrayPath } from '../../types'

import { pluckIndex, pushToIndex } from '../utils/data'

export function valueReducer<Data>(value: Data, action: ValueAction<Data>): Data {
  switch (action.type) {
    case 'EXTERNAL_CHANGE':
      return action.value
    case 'CHANGE':
      return set(toArrayPath(action.path), action.value, value)
    case 'MOVE_ITEM': {
      const { from, fromIndex, to, toIndex } = action
      const toPath = toArrayPath(to)

      if (from === to) {
        return modify(toPath, (items: unknown[]) => arrayMove(items, fromIndex, toIndex), value)
      }

      const fromPath = toArrayPath(from)
      const movedItem = get(fromPath, value)[fromIndex]
      return modify(
        toPath, pushToIndex(toIndex, movedItem),
        modify(fromPath, pluckIndex(fromIndex), value)
      )
    }
  }
}
