import { useState } from 'react'

import { showcase } from '../types'

import { Switch } from 'libraries/forms'

function SwitchShowcase() {
  const [on, setOn] = useState(false)
  return <div className="grid grid-cols-2 grid-rows-2 grid-flow-row">
    <Switch id="demo-switch1" value={on} onChange={setOn} label="Switch" />
    <Switch id="demo-switch2" value={!on} onChange={(v) => setOn(!v)} label="Opposite switch" />
    <Switch id="demo-switch3" value={on} readOnly label="Readonly switch" onChange={() => {}} />
    <Switch id="demo-switch4" value={!on} readOnly label="Opposite readonly switch" onChange={() => {}} />
  </div>
}

SwitchShowcase.showCase = showcase({
  title: 'Switch',
  props: {},
  render: () => <SwitchShowcase />,
})

export { SwitchShowcase }
