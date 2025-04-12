import type { AnyType, FieldPath } from '../types'

import { Flex } from 'libraries/ui'

import { type ConnectedFieldProps, ConnectedInput } from './ConnectedInput'
import { Fieldset } from './containers/Fieldset'
import { type ListItem, Repeater } from './Repeater'
import { RepeaterProps } from './Repeater/Repeater'

export type RepeatingFieldProps<Output extends Input & ListItem, Extra, Input, Data = AnyType, AcceptedTypeDefs = null> =
  ConnectedFieldProps<Output, Extra, Input, Data> & {
    label: string
  } & Omit<RepeaterProps<Output, Data, AcceptedTypeDefs>, 'children'>

export function RepeatingField<Output extends Input & ListItem, Extra, Input, Data = AnyType>(
  {label, path, table, component, accepts, itemType, ...extra}: RepeatingFieldProps<Output, Extra, Input, Data>
) {
  return <Fieldset label={label}>
    <Repeater path={path} table={table} accepts={accepts} itemType={itemType}>
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
  </Fieldset>
}
