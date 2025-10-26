import type { AnyType } from '../types'

import { type ListItem, Repeater, type RepeaterProps } from './dnd'

export type RepeatingTableRowsProps<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null> =
  Omit<RepeaterProps<Value, Data, AcceptedTypeDefs>, 'asElement' | 'itemElement'>

export function RepeatingTableRows<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null>(
  {path, accepts, itemType, children}: RepeatingTableRowsProps<Value, Data, AcceptedTypeDefs>
) {
  return <Repeater path={path} accepts={accepts} itemType={itemType} asElement="tbody" itemElement="tr">
    {children}
  </Repeater>
}

export default RepeatingTableRows
