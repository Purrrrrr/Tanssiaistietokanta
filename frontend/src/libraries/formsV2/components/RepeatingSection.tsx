import type { AnyType } from '../types'

import { Fieldset } from './containers/Fieldset'
import { type ListItem, type RepeatingSectionProps as DndRepeatingSectionProps, RepeatingSection as DndRepeatingSection } from './dnd'

export interface RepeatingSectionProps<Output extends ListItem, Data = AnyType, AcceptedTypeDefs = null> extends DndRepeatingSectionProps<Output, Data, AcceptedTypeDefs> {
  label: string
}

export function RepeatingSection<Output extends ListItem, Data = AnyType, AcceptedTypeDefs = null>(
  {label, path, accepts, itemType, children, itemElement }: RepeatingSectionProps<Output, Data, AcceptedTypeDefs>
) {
  return <Fieldset label={label}>
    <DndRepeatingSection path={path} accepts={accepts} itemType={itemType} itemElement={itemElement}>
      {children}
    </DndRepeatingSection>
  </Fieldset>
}
