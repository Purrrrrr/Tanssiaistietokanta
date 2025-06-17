import type { AnyType, FieldPath } from '../types'

import { Button } from 'libraries/ui'

import { type ConnectedFieldProps, ConnectedInput } from './ConnectedInput'
import { type ListItem } from './dnd'
import { type RepeatingSectionProps, RepeatingSection } from './RepeatingSection'

export type RepeatingFieldProps<Output extends Input & ListItem, Extra, Input, Data = AnyType, AcceptedTypeDefs = null> =
  Omit<ConnectedFieldProps<Output, Extra, Input, Data>, 'path'> &
  Omit<RepeatingSectionProps<Output, Data, AcceptedTypeDefs>, 'children'>

export function RepeatingField<Output extends Input & ListItem, Extra, Input, Data = AnyType, AcceptedTypeDefs = null>(
  {label, path, component, accepts, itemType, ...extra}: RepeatingFieldProps<Output, Extra, Input, Data, AcceptedTypeDefs>
) {
  // TODO: flex as itemElement
  return <RepeatingSection label={label} path={path} accepts={accepts} itemType={itemType}>
    {({ dragHandle, id, path: itemPath, index, onRemove }) =>
      <div className="flex">
        <ConnectedInput<Output, Extra, Input, Data>
          id={String(id)}
          path={`${itemPath}.${index}` as FieldPath<Input, Output, Data>}
          component={component}
          {...extra as Extra & Omit<ConnectedFieldProps<Output, Extra, Input, Data>, 'path' | 'component'>} />
        {dragHandle}
        <Button color="danger" icon="cross" onClick={onRemove} />
      </div>
    }
  </RepeatingSection>
}
