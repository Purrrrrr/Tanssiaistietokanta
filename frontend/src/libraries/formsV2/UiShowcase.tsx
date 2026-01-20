import { useState } from 'react'

import { ConflictHandler } from 'libraries/forms/ConflictHandler'
import { formFor, withDefaults } from 'libraries/formsV2'
import { Button } from 'libraries/ui'
import { Cross, Edit } from 'libraries/ui/icons'

import { AutocompleteInput, SegmentedInput, Select, TextInput } from './components/inputs'

interface Data {
  a: string
  d?: string
  b: string | null
  bo?: boolean
  s: string[]
  l: L[]
  l2: L[]
  num: number
  rangeStart: Date | null
  rangeEnd: Date | null
}
interface L {
  _id: string
  value: string
}

const {
  Form, Field, RepeatingSection,
  useAddItem,
  selectWithType,
} = formFor<Data, { l: L, s: string }>()

const defaultData: Data = {
  a: '', b: '',
  l: [{ _id: '1', value: 'a' }, { _id: '2', value: 'b' }, { _id: '5', value: 'a2' }, { _id: '6', value: 'b2' }],
  l2: [{ _id: '3', value: 'c' }, { _id: '4', value: 'd' }],
  s: ['aa', 'bb'],
  num: 0,
  rangeStart: new Date(),
  rangeEnd: new Date(),
}

export default function UiShowcase() {
  const [key, setKey] = useState<number>(0)
  const [value, onChange] = useState<Data>(defaultData)

  return <Form value={value} onChange={onChange}>
    <Button className="my-2" onClick={() => { setKey(key + 1); onChange(defaultData) }}>
      RESET
    </Button>
    <ShowcaseContents key={key} />
  </Form>
}

const choices = [
  'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai',
]
const longChoices = Array(100).fill(0).map((_, i) => i)

const S = withDefaults(selectWithType<string>(), {
  items: choices,
  filterPlaceholder: 'Hae...',
})
const S2 = withDefaults(selectWithType<number>(), {
  items: longChoices,
  filterPlaceholder: 'Hae...',
})

function ShowcaseContents() {
  const [s, setS] = useState<string | null>('a')
  const [s2, setS2] = useState<string | null>('a')
  const [s3, setS3] = useState<string>('')
  // const addToL = useAddItemAt('l')
  const addItem = useAddItem()
  // const removeFromL = useRemoveItemAt('l')
  // const removeItem = useRemoveItem()

  return <>
    <S path="a" label="Viikonpäivä" placeholder="Valitse" />
    <S2 path="num" label="Numero" />
    <hr />
    <ConflictHandler
      localValue={<input className="block border" defaultValue="fuu" />}
      serverValue={<input className="block border" defaultValue="fuu" />}
      onResolve={() => {}}
    />
    <div>
      SegmentedInput
      {' '}
      <SegmentedInput value={s3} onChange={setS3} />
    </div>
    <Select
      filterable
      aria-label="jotakin"
      items={choices}
      value={s}
      onChange={setS}
      id="test"
      filterPlaceholder="Hae..."
      itemToString={String}
      itemIcon={item => <Ball name={item} />}
    />
    <Field.Date path="rangeStart" label="Start" locale="fi-FI" />
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
    <Field.Text label="aaa" path="b" />
    <Field.Switch path="bo" label="Is it on?" />
    <Field.Markdown path="d" label="markdooown" />
    <RepeatingSection<L> path="l" label="l" accepts="l" itemType="l">
      {({ dragHandle, path, index, onRemove }) =>
        <div className="flex">
          <Field.Text label="Value" inline labelStyle="beside" path={`${path}.${index}.value`} />
          {dragHandle}
          <Button color="danger" icon={<Cross />} onClick={onRemove} />
        </div>
      }
    </RepeatingSection>
    <Button color="primary" icon={<Edit />} onClick={() => addItem('l', { _id: id(), value: '' })} />
    <Select
      aria-label="jotakin"
      items={choices}
      value={s2}
      onChange={setS2}
      id="test2"
      filterPlaceholder="Hae..."
      itemToString={String}
      itemIcon={item => <Ball name={item} />}
    />
    <RepeatingSection<L> path="l2" label="l 2" accepts="l" itemType="l">
      {({ dragHandle, path, index, onRemove }) =>
        <div className="flex">
          <Field.Text label="Value" inline labelStyle="beside" path={`${path}.${index}.value`} />
          {dragHandle}
          <Button color="danger" icon={<Cross />} onClick={onRemove} />
        </div>
      }
    </RepeatingSection>
    <Button color="primary" icon={<Edit />} onClick={() => addItem('l2', { _id: id(), value: '' })} />
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
