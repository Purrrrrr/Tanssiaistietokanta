import type { AnyType, FieldPath } from '../types'

import { Flex } from 'libraries/ui'

import { type ConnectedFieldProps, ConnectedInput } from './ConnectedInput'
import { Fieldset } from './containers/Fieldset'
import { type ListItem, Repeater } from './Repeater'

export type RepeatingFieldProps<Output extends Input & ListItem, Extra, Input, Data = AnyType> =
  ConnectedFieldProps<Output, Extra, Input, Data> & {
    table?: boolean
    label: string
    path: FieldPath<Output[], Output[], Data>
  }

export function RepeatingField<Output extends Input & ListItem, Extra, Input, Data = AnyType>({label, path, table, component, ...extra}: RepeatingFieldProps<Output, Extra, Input, Data>) {
  return <Fieldset label={label}>
    <Repeater path={path} table={table}>
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
