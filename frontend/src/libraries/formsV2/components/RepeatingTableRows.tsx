import type { AnyType } from '../types'

import { type ListItem, type RepeatingSectionProps, RepeatingSection } from './dnd'

export type RepeatingTableRowsProps<Output extends ListItem, Data = AnyType, AcceptedTypeDefs = null> =
  Omit<RepeatingSectionProps<Output, Data, AcceptedTypeDefs>, 'asElement' | 'itemElement'>

export function RepeatingTableRows<Output extends ListItem, Data = AnyType>(
  {path, accepts, itemType, children}: RepeatingTableRowsProps<Output, Data>
) {
  return <RepeatingSection path={path} accepts={accepts} itemType={itemType} asElement="tbody" itemElement="tr">
    {children}
  </RepeatingSection>
}
