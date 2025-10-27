import type { AnyType } from '../types'

import { Fieldset } from './containers/Fieldset'
import { type ListItem, Repeater, type RepeaterProps } from './dnd'

export interface RepeatingSectionProps<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null> extends RepeaterProps<Value, Data, AcceptedTypeDefs> {
  label: string
}

export function RepeatingSection<Value extends ListItem, Data = AnyType, AcceptedTypeDefs = null>(
  { label, path, accepts, itemType, children, itemElement }: RepeatingSectionProps<Value, Data, AcceptedTypeDefs>,
) {
  return <Fieldset label={label}>
    <Repeater path={path} accepts={accepts} itemType={itemType} itemElement={itemElement}>
      {children}
    </Repeater>
  </Fieldset>
}

export default RepeatingSection
