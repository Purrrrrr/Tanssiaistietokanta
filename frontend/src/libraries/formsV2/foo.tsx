import { useState } from 'react'

import { Form } from './Form'
import { formFor, ListField, TextInput } from './index'

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
  Field, TextField, Switch, MarkdownField,
} = formFor<Data>()

export default function Foo() {
  const [value, onChange] = useState<Data>({a: '', b: '', l: [{_id: '1', value: ''}, {_id: '2', value: ''}], l2: [{_id: '3', value: ''}, {_id: '4', value: ''}], s: ['aa', 'bb']})
  return <Form value={value} onChange={onChange}>
    <h2>FOO</h2>
    <Field label="aaa" path="a" required component={TextInput} />
    <TextField label="aaa" path="b" />
    <Switch path="bo" label="Is it on?" />
    <MarkdownField path="d" label="markdooown" />
    <ListField path="s" label="Strings" component={TextInput} />
    <ListField path="l" label="l"
      component={
        ({value, onChange}: {value: L, onChange: (l: L) => unknown}) =>
          <input type="text" value={value.value} onChange={e => onChange({ ...value, value: e.target.value})} />
      }
    />
    ---
    <ListField path="l2" label="l 2"
      component={
        ({value, onChange}: {value: L, onChange: (l: L) => unknown}) =>
          <input type="text" value={value.value} onChange={e => onChange({ ...value, value: e.target.value})} />
      }
    />
  </Form>
}
