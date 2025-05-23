import { useState } from 'react'

import { Button, Flex } from 'libraries/ui'

import { FilterableSelect } from './components/inputs/selectors/FilterableSelect'
import { Select } from './components/inputs/selectors/Select'
import { Combobox, formFor, TextInput } from './index'
import { AutocompleteInput } from './components/inputs/selectors/AutocompleteInput'

interface Data {
  a: string
  d?: string
  b: string | null
  bo?: boolean
  s: string[]
  l: L[]
  l2: L[]
  rangeStart: Date | null,
  rangeEnd: Date | null,
}
interface L {
  _id: string
  value: string
}

const {
  Form, Field, RepeatingSection, RepeatingTableRows,
  useAddItem, useAddItemAt, useRemoveItem, useRemoveItemAt,
} = formFor<Data, {'l': L, 's': string}>()

export default function Foo() {
  const [value, onChange] = useState<Data>({
    a: '', b: '',
    l: [{_id: '1', value: 'a'}, {_id: '2', value: 'b'}, {_id: '5', value: 'a2'}, {_id: '6', value: 'b2'}],
    l2: [{_id: '3', value: 'c'}, {_id: '4', value: 'd'}],
    s: ['aa', 'bb'],
    rangeStart: new Date(),
    rangeEnd: new Date(),
  })

  return <Form value={value} onChange={onChange}>
    <h2>FOO</h2>
    <FooContents />
  </Form>
}

const choices = [
  'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai',
]

function FooContents() {
  const [s, setS] = useState<string | null>('a')
  const [s2, setS2] = useState<string | null>('a')
  const addToL = useAddItemAt('l')
  const addItem = useAddItem()
  const removeFromL = useRemoveItemAt('l')
  const removeItem = useRemoveItem()

  return <>
    <FilterableSelect
      aria-label="jotakin"
      items={choices}
      value={s}
      onChange={setS}
      id="test"
      placeholder="valitse"
      itemToString={String}
      itemIcon={item => <Ball name={item} />}
    />
    <Field.Date path="rangeStart" label="Start" locale="fi-FI" />
    {false &&
      <Combobox
        items={choices}
        value={s}
        onChange={setS}
        id="test"
        placeholder="valitse"
        renderItem={String}
      />
    }
    <p>{s}</p>
    <AutocompleteInput
      items={choices}
      value={s}
      onChange={setS}
      id="test3"
      placeholder="valitse"
      itemToString={String}
      itemIcon={item => <Ball name={item} />}
    />
    <Field.DateRange startPath="rangeStart" endPath="rangeEnd" label="Range" />
    <Field.Custom label="aaa" path="a" required component={TextInput} />
    <Field.Repeating path="s" label="Strings" component={TextInput} />
    <Field.Text label="aaa" path="b" />
    <Field.Switch path="bo" label="Is it on?" />
    <Field.Markdown path="d" label="markdooown" />
    <RepeatingSection<L> path="l" label="l" accepts="l" itemType="l">
      {({ dragHandle, path, index, onRemove }) =>
        <Flex>
          <Field.Text label="Value" inline labelStyle="beside" path={`${path}.${index}.value`} />
          {dragHandle}
          <Button intent="danger" icon="cross" onClick={onRemove} />
        </Flex>
      }
    </RepeatingSection>
    <Button intent="primary" icon="edit" onClick={() => addItem('l', { _id: id(), value: '' })} />
    <Select
      aria-label="jotakin"
      items={choices}
      value={s2}
      onChange={setS2}
      id="test2"
      placeholder="valitse"
      itemToString={String}
      itemIcon={item => <Ball name={item} />}
    />
    <RepeatingSection<L> path="l2" label="l 2" accepts="l" itemType="l">
      {({ dragHandle, path, index, onRemove }) =>
        <Flex>
          <Field.Text label="Value" inline labelStyle="beside" path={`${path}.${index}.value`} />
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

function Ball({ name }: { name?: string | null }) {
  return <span aria-hidden className="inline-block p-1 mr-1 w-6 text-center bg-amber-500 rounded-full">
    {(name ?? 'X').slice(0, 1)}
  </span>
}
