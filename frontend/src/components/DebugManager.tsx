import {useState} from 'react'

import { Button } from 'libraries/ui'
import {enableNamespaces, getKnownNamespaces} from 'utils/debug'

export default function DebugManager() {
  const [state, setState] = useState(() => Array.from(getKnownNamespaces().entries()))
  const [visible, setVisible] = useState(false)

  return <>
    <Button minimal className="p-2" onClick={() => setVisible(!visible)}>⚙</Button>
    <fieldset className={`fixed bottom-7.5 right-1.5 items-start flex flex-col bg-white border-stone-500 border-1 shadow-sm shadow-stone-600/50 p-2 transition-opacity ${visible ? '' : 'opacity-0'}`}>
      <legend>Debug namespaces</legend>
      <Button minimal className="absolute top-0 right-1.5 p-2" onClick={() => setVisible(false)}>x</Button>
      {state.map(([namespace, enabled]) =>
        <label key={namespace}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={event => {
              enableNamespaces(state.filter(([ns, e]) => ns === namespace ? event.target.checked : e).map(pair => pair[0]))
              setState(Array.from(getKnownNamespaces().entries()))
            }}
          />
          {' '+namespace}
        </label>
      )}
    </fieldset>
  </>
}
