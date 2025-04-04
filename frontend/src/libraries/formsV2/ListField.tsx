import type { AnyType, FieldPath, ValidationProps } from './types'

import { type ConnectedFieldProps, ConnectedInput } from './components/ConnectedInput'
import { type ExternalBareFieldContainerProps, BareFieldContainer } from './components/FieldContainer'
import type { FieldInputComponent, OmitInputProps } from './components/inputs'
import { type ListItem, Repeater } from './components/Repeater'

export type ListFieldProps<Output extends Input, Extra, Input extends ListItem, Data = AnyType> = ValidationProps &
  ExternalBareFieldContainerProps &
  OmitInputProps<Extra> & {
    component: FieldInputComponent<Output, Extra, Input>
    path: FieldPath<Output[], Output[], Data>
  }

export type ListFieldProps2<Output extends Input, Extra, Input extends ListItem, Data = AnyType> =
  ExternalBareFieldContainerProps & ConnectedFieldProps<Output, Extra, Input, Data>

export function ListField<Output extends Input, Extra, Input extends ListItem, Data = AnyType>({path, label, component: C, required, schema, ...extra}: ListFieldProps<Output, Extra, Input, Data>) {
  return <BareFieldContainer labelFor="" label={label}>
    <Repeater path={path}>
      {({ id, index }) =>
        <>
          <ConnectedInput
            id={String(id)}
            path={`${path}.${index}`}
            component={C}
            required={required}
            schema={schema}
            {...extra as Extra} />
        </>
      }
    </Repeater>
  </BareFieldContainer>
}
