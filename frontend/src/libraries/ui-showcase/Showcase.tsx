import { ReactNode, useId, useState } from 'react'

import { Switch, TextInput } from 'libraries/formsV2/components/inputs'
import { Card, CssClass } from 'libraries/ui'

interface ShowcaseProps<P extends PropDefs> {
  title: string
  propDefs: P
  children: (props: PropTypes<P>) => ReactNode
}

export type PropDefs = Record<string, PropDef>
type PropDef =
  | { type: 'string', default?: string }
  | { type: 'boolean', default?: boolean }
  | { type: 'number', default?: number, min?: number }

type PropTypes<P extends PropDefs> = {
  [K in keyof P]: PropType<P[K]>
}
type PropType<P extends PropDef> = P['default']//Exclude<P['default'], undefined>

export function Showcase<P extends PropDefs>(showcase: ShowcaseProps<P>) {
  const { title, propDefs, children } = showcase
  const [props, setProps] = useState<PropTypes<P>>(() =>
    Object.fromEntries(
      Object.entries(propDefs).map(([name, def]) => {
        return [name, defaultValue(def)]
      })
    ) as PropTypes<P>
  )
  const fields = Object.entries(propDefs).map(([name, def]) =>
    <PropField key={name} label={name} def={def} value={props[name]} onChange={value => setProps(old => ({...old, [name]: value}))} />
  )

  return <Card>
    <h2>{title}</h2>
    <div className="flex justify-between items-center">
      <div className="p-2">{children(props)}</div>
      {fields.length > 0 && <div className="p-2 pl-7 border-l-1 border-stone-300">{fields}</div>}
    </div>
  </Card>

}

function defaultValue(def: PropDef) {
  switch(def.type) {
    case 'string':
      return def.default ?? ''
    case 'boolean':
      return def.default ?? false
    case 'number':
      return def.default ?? def.min ?? 0
  }
}

interface PropFieldProps<P extends PropDef> {
  def: P
  label: string
  value: PropType<P>
  onChange: (value: PropType<P>) => unknown
}

function PropField<P extends PropDef>({def, label, value, onChange}: PropFieldProps<P>) {
  const id = useId()
  switch(def.type) {
    case 'string':
      return <div>
        <label className="p-2" htmlFor={id}>{label}</label>
        <TextInput id={id} value={value as string} onChange={onChange} />
      </div>
    case 'boolean':
      return <div>
        <Switch id={id} label={label} value={value as boolean} onChange={onChange} />
      </div>
    case 'number':
      return <div>
        <label className="p-2" htmlFor={id}>{label}</label>
        <input type="number" className={CssClass.input} id={id} value={value as number} min={def.min} onChange={e => onChange(parseFloat(e.target.value))} />
      </div>
  }
}
