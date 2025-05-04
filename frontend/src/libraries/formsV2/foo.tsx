import { useState } from 'react'

import { Flex } from 'libraries/ui'

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
  RepeatingSection,
} = formFor<Data, {'l': L, 's': string}>()

export default function Foo() {
  const [value, onChange] = useState<Data>({a: '', b: '', l: [{_id: '1', value: 'a'}, {_id: '2', value: 'b'}], l2: [{_id: '3', value: 'c'}, {_id: '4', value: 'd'}], s: ['aa', 'bb']})
  return <Form value={value} onChange={onChange}>
    <h2>FOO</h2>
    <Field label="aaa" path="a" required component={TextInput} />
    <RepeatingField path="s" label="Strings" component={TextInput} />
    <TextField label="aaa" path="b" />
    <Switch path="bo" label="Is it on?" />
    <MarkdownField path="d" label="markdooown" />
    <RepeatingSection<L> path="l" label="l" accepts="l" itemType="l">
      {({ dragHandle, path, index }) =>
        <Flex>
          <TextField label="Value" labelStyle="beside" path={`${path}.${index}.value`} />
          {dragHandle}
        </Flex>
      }
    </RepeatingSection>
    <RepeatingSection<L> path="l2" label="l 2" accepts="l" itemType="l">
      {({ dragHandle, path, index }) =>
        <Flex>
          <TextField label="Value" labelStyle="beside" path={`${path}.${index}.value`} />
          {dragHandle}
        </Flex>
      }
    </RepeatingSection>
  </Form>
}
