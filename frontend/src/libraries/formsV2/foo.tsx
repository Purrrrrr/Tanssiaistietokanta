import { useState } from 'react'

import { Button, Flex } from 'libraries/ui'

import { formFor, TextInput } from './index'

interface Data {
  a: string
  d?: string
  b: string | null
  bo?: boolean
  s: string[]
  l: L[]
  l2: L[]
}
interface L {
  _id: string
  value: string
}

const {
  Form, Field, TextField, Switch, MarkdownField, RepeatingField,
  RepeatingSection, RepeatingTableRows,
  useAddItem, useAddItemAt, useRemoveItem, useRemoveItemAt,
} = formFor<Data, {'l': L, 's': string}>()

export default function Foo() {
  const [value, onChange] = useState<Data>({a: '', b: '', l: [{_id: '1', value: 'a'}, {_id: '2', value: 'b'}, {_id: '5', value: 'a2'}, {_id: '6', value: 'b2'}], l2: [{_id: '3', value: 'c'}, {_id: '4', value: 'd'}], s: ['aa', 'bb']})

  return <Form value={value} onChange={onChange}>
    <h2>FOO</h2>
    <FooContents />
  </Form>
}

function FooContents() {
  const addToL = useAddItemAt('l')
  const addItem = useAddItem()
  const removeFromL = useRemoveItemAt('l')
  const removeItem = useRemoveItem()

  return <>
    <Field label="aaa" path="a" required component={TextInput} />
    <RepeatingField path="s" label="Strings" component={TextInput} />
    <TextField label="aaa" path="b" />
    <Switch path="bo" label="Is it on?" />
    <MarkdownField path="d" label="markdooown" />
    <RepeatingSection<L> path="l" label="l" accepts="l" itemType="l">
      {({ dragHandle, path, index, onRemove }) =>
        <Flex>
          <TextField label="Value" inline labelStyle="beside" path={`${path}.${index}.value`} />
          {dragHandle}
          <Button intent="danger" icon="cross" onClick={onRemove} />
        </Flex>
      }
    </RepeatingSection>
    <Button intent="primary" icon="edit" onClick={() => addItem('l', { _id: id(), value: '' })} />
    <RepeatingSection<L> path="l2" label="l 2" accepts="l" itemType="l">
      {({ dragHandle, path, index, onRemove }) =>
        <Flex>
          <TextField label="Value" inline labelStyle="beside" path={`${path}.${index}.value`} />
          {dragHandle}
          <Button intent="danger" icon="cross" onClick={onRemove} />
        </Flex>
      }
    </RepeatingSection>
    <Button intent="primary" icon="edit" onClick={() => addItem('l2', { _id: id(), value: '' })} />
    <table>
      <RepeatingTableRows<L> path="l">
        {({ dragHandle, value, onRemove }) =>
          <>
            <td>fuu</td>
            <td>{value.value}</td>
            <td>
              {dragHandle}
              <Button intent="danger" icon="cross" onClick={onRemove} />
            </td>
          </>
        }
      </RepeatingTableRows>
    </table>
  </>
}

let i = 0
function id() {
  return `id-${i++}`
}
