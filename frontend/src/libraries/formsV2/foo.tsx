import { useState } from 'react'

import { Form } from './Form'
import { formFor, TextInput } from './index'

interface Data {
  a: string
  d?: string
  b: string | null
}

const {
  Field, TextField
} = formFor<Data>()

export default function Foo() {
  const [value, onChange] = useState<Data>({a: '', b: ''})
  return <Form value={value} onChange={onChange}>
    <h2>FOO</h2>
    <Field label="aaa" path="a" component={TextInput} />
    <TextField label="aaa" path="b" />
  </Form>
}
