import React, { useState } from 'react'
import useAutosavingState, {makePartial} from 'utils/useAutosavingState'
import SyncStatus from 'components/SyncStatus'

const obj = {
  amount: 1,
  name: 'text',
  description: 'text',
}

export function SampleEditor() {
  const [state, setState] = useState(obj)

  return <div>
    <p>{JSON.stringify(state)}</p>
    <Editor
      serverState={state}
      onPatch={(m) => setState(state => ({...state, ...m}))}
      fields={[
        { name: 'name', label: 'Name', inputType: 'text' },
        { name: 'description', label: 'Description', inputType: 'text' },
        { name: 'amount', label: 'Amount', inputType: 'number' },
      ]}
    />
  </div>
}

interface EditorProps<T extends RO> {
  serverState: T
  onPatch: (item: Partial<T>) => any,
  fields: FieldDef<T>[],
}

interface RO {
  [index: string]: string | number
}

interface FieldDef<T extends RO> {
  name: keyof T,
  label: string,
  inputType: 'number' | 'text'
}

function Editor<T extends RO>({
  serverState,
  onPatch,
  fields,
} : EditorProps<T>) {
  const [item, setItem, s] = useAutosavingState<T, Partial<T>>(serverState, onPatch, makePartial)

  return <section>
    <h1>Editor</h1>
    <pre>{JSON.stringify(s, null, 2)}</pre>
    <p>
      <SyncStatus state={s.state} />
    </p>
    {fields.map(field =>
      <Field
        key={field.name as string}
        field={field}
        item={item}
        setItem={setItem}
      />)}
  </section>

}

interface FieldProps<T extends RO> {
  field: FieldDef<T>,
  item: T,
  setItem: (item: T) => any,
}

function Field<T extends RO>({field, item, setItem} : FieldProps<T>) {
  return <p>
    <label>{field.label}</label>
    <input
      type={field.inputType}
      name={field.name as string}
      value={item[field.name]}
      onChange={(e) => setItem({...item, [field.name]: e.target.value})}
    />
  </p>
}
