import { useState } from 'react'

import { Form } from './Form'
import { formFor, SuperTextInput, TextInput } from './scrapbook'

interface Data {
  a: string
  d?: string
  b: string | null
}

const {
  withComponent, Field
} = formFor<Data>()

const Input = withComponent(TextInput)

export default function Foo() {
  const [value, onChange] = useState<Data>({a: '', b: ''})
  return <Form value={value} onChange={onChange}>
    <h2>FOO</h2>
    <Field label="aaa" path="a" component={TextInput} />
    <Field label="aaa" path="a" component={SuperTextInput} super={1}/>
    <Input label="aaa" path="b" />
  </Form>
}
