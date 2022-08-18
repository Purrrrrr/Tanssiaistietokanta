import React, {useEffect, useRef, useState } from 'react';
import {Intent, Icon} from "@blueprintjs/core";
import useAutosavingState, {SyncState} from 'utils/useAutosavingState';

const obj = {
  amount: 1,
  name: 'text',
  description: 'text',
}

export function SampleEditor() {
  const [state, setState, time] = useMonkey(obj)

  return <div>
    <p>{time} seconds to mutation</p>
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
  const [item, setItem, s] = useAutosavingState(serverState, onPatch)

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

function SyncStatus({state} : { state : SyncState }) {
  switch(state) {
    case 'IN_SYNC':
      return <><Icon icon="saved" intent={Intent.SUCCESS} /> Tallennettu</>
    case 'MODIFIED_LOCALLY':
      return <><Icon icon="refresh" intent={Intent.PRIMARY} /> Tallennetaan...</>
    case 'CONFLICT':
      return <><Icon icon="outdated" intent={Intent.WARNING} /> Synkronointivirhe</>
  }
  return null
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

function useMonkey(obj) {
  const [item, setItem] = useState(obj)
  const time = useRef(0)

  useEffect(() => {
    const timeout = setInterval(() => {
      if (time.current <= 0) {
        time.current = Math.ceil(Math.random()*5)
        setItem(monkeyAround)
      } else {
        time.current--
        setItem(a => ({ ...a}))
      }
    }, 1000)    

    return () => clearInterval(timeout)
  }, [obj, time])

  return [item, setItem, time.current]
}

function monkeyAround(item) {
  // const keys = Object.keys(item)
  const randomKey = 'name'
  let value = item[randomKey]
  switch(typeof value) {
    case 'number':
      value = Math.floor(Math.random()*100)
      break
    case 'string':
      value = pickRandom(['happy', 'naughty', 'wonderful'])+" "+pickRandom(['fish', 'cat', 'dog'])
      break
  }


  return {
    ...item,
    [randomKey]: value,
  }
}

function pickRandom(arr) {
  return arr[Math.floor(arr.length*Math.random())]
}
