import { useDndContext } from '@dnd-kit/core'

import { AcceptedTypes, ItemData, ListItem } from './types'

export function useIsDropAreaDisabled<Value extends ListItem, AcceptedTypeDefs = null>(
  dropAreaId: string,
  accepts?: AcceptedTypes<Value, AcceptedTypeDefs>
) {
  const { active } = useDndContext()

  const activeItemData = active?.data.current as ItemData | undefined
  const activeIsFromOtherRepeatable = activeItemData != null && activeItemData.dropAreaId !== dropAreaId
  return activeIsFromOtherRepeatable && !isDropAccepted(activeItemData?.itemType, accepts)
}

function isDropAccepted<T>(itemType: T, accepted?: T | T[]): boolean {
  if (Array.isArray(accepted)) {
    return accepted.includes(itemType)
  }

  return accepted !== undefined && accepted === itemType
}
