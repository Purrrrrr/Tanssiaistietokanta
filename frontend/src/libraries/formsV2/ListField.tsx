import type { AnyType, FieldPath } from './types'

import { Flex } from 'libraries/ui'

import { type ConnectedFieldProps, ConnectedInput } from './components/ConnectedInput'
import { Fieldset } from './components/Fieldset'
import { type ListItem, Repeater } from './components/Repeater'

export type ListFieldProps<Output extends Input & ListItem, Extra, Input, Data = AnyType> =
  ConnectedFieldProps<Output, Extra, Input, Data> & {
    label: string
    path: FieldPath<Output[], Output[], Data>
  }

export function ListField<Output extends Input & ListItem, Extra, Input, Data = AnyType>({label, path, component, ...extra}: ListFieldProps<Output, Extra, Input, Data>) {
  return <Fieldset label={label}>
    <Repeater path={path}>
      {({ dragHandle, id, index }) =>
        <Flex>
          <ConnectedInput<Output, Extra, Input, Data>
            id={String(id)}
            path={`${path}.${index}` as FieldPath<Input, Output, Data>}
            component={component}
            {...extra as Extra & Omit<ConnectedFieldProps<Output, Extra, Input, Data>, 'path' | 'component'>} />
          {dragHandle}
        </Flex>
      }
    </Repeater>
  </Fieldset>
}
