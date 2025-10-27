import { useId, useState } from 'react'

import { PropDef, Showcase } from './types'

import { Switch, TextInput } from 'libraries/formsV2/components/inputs'
import { Card, CssClass, H2 } from 'libraries/ui'

export function ShowcaseContainer<P extends Record<string, unknown>>({ title, props, render }: Showcase<P>) {
  const [propsValue, setPropsValue] = useShowcaseState(props)

  const fields = Object.entries(props).map(([name, def]) =>
    <PropField
      key={name}
      label={name}
      def={def}
      value={propsValue[name]}
      onChange={value => {
        setPropsValue(old => ({ ...old, [name]: value }))
      }}
    />,
  )

  return <Card>
    <H2>{title}</H2>
    <div className="flex justify-between items-center">
      <div className="p-2">{render(propsValue)}</div>
      {fields.length > 0 && <div className="p-2 pl-7 border-l-1 border-stone-300">{fields}</div>}
    </div>
  </Card>
}

function useShowcaseState<P extends Record<string, unknown>>(props: Showcase<P>['props']) {
  return useState<P>(() =>
    Object.fromEntries(
      Object.entries(props).map(([name, def]) => {
        return [name, def.default]
      }),
    ) as P,
  )
}

interface PropFieldProps<T> {
  def: PropDef<T>
  label: string
  value: T
  onChange: (value: T) => unknown
}

function PropField<T>({ def, label, value, onChange }: PropFieldProps<T>) {
  const id = useId()
  switch (def.type) {
    case 'string':
      return <div>
        <label className="p-2" htmlFor={id}>{label}</label>
        <TextInput
          id={id}
          value={value as string}
          onChange={onChange as (v: string) => unknown} />
      </div>
    case 'boolean':
      return <div>
        <Switch
          id={id}
          label={label}
          value={value as boolean}
          onChange={onChange as (v: boolean) => unknown} />
      </div>
    case 'number':
      return <div>
        <label className="p-2" htmlFor={id}>{label}</label>
        <input
          type="number"
          className={CssClass.input}
          id={id}
          value={value as number}
          min={def.min}
          max={def.max}
          step={def.step}
          onChange={e => onChange(parseFloat(e.target.value) as T)}
        />
      </div>
    case 'other':
      return <div>
        <label className="p-2" htmlFor={id}>{label}</label>
        {def.renderControl(value, onChange)}
      </div>
  }
}
