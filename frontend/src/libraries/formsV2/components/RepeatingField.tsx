import { useId } from 'react'

import type { AnyType, FieldPath } from '../types'

import { Flex } from 'libraries/ui'

import { useValueAt } from '../hooks'
import { type ConnectedFieldProps, ConnectedInput } from './ConnectedInput'
import { Fieldset } from './containers/Fieldset'
import { type ListItem, type RepeaterProps, DropArea, Repeater } from './dnd'

export type RepeatingFieldProps<Output extends Input & ListItem, Extra, Input, Data = AnyType, AcceptedTypeDefs = null> =
  Omit<ConnectedFieldProps<Output, Extra, Input, Data>, 'path'> &
  Omit<RepeaterProps<Output, Data, AcceptedTypeDefs>, 'children' | 'dropAreaId'> & {
    label: string
  }

export function RepeatingField<Output extends Input & ListItem, Extra, Input, Data = AnyType>(
  {label, path, component, accepts, itemType, ...extra}: RepeatingFieldProps<Output, Extra, Input, Data>
) {
  const id = useId()
  const values = useValueAt<Output[], Data>(path)

  return <Fieldset label={label}>
    <DropArea id={id} path={path} accepts={accepts} disabled={values.length > 0}>
      <Repeater dropAreaId={id} path={path} accepts={accepts} itemType={itemType}>
        {({ dragHandle, id, path: itemPath, index }) =>
          <Flex>
            <ConnectedInput<Output, Extra, Input, Data>
              id={String(id)}
              path={`${itemPath}.${index}` as FieldPath<Input, Output, Data>}
              component={component}
              {...extra as Extra & Omit<ConnectedFieldProps<Output, Extra, Input, Data>, 'path' | 'component'>} />
            {dragHandle}
          </Flex>
        }
      </Repeater>
    </DropArea>
  </Fieldset>
}
