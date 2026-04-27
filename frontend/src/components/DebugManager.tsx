import { useState } from 'react'

import { Button } from 'libraries/ui'
import { enableNamespaces, getKnownNamespaces } from 'utils/debug'

export default function DebugManager() {
  const lexicalDebugStylesEnabled = localStorage.getItem('lexical_debug_styles') === 'true'
  const debugStylesEnabled = localStorage.getItem('debug_styles') !== 'false'
  const [state, setState] = useState(() => Array.from(getKnownNamespaces().entries()))
  const [visible, setVisible] = useState(false)

  return <>
    <Button minimal className="p-2" onClick={() => setVisible(!visible)}>⚙</Button>
    <div className={`fixed bottom-7.5 right-1.5  text-left bg-white border-stone-500 border-1 shadow-sm shadow-stone-600/50 p-2 transition-opacity ${visible ? '' : 'opacity-0 pointer-events-none'} p-2`}>
      <Button minimal className="float-end p-2" onClick={() => setVisible(false)}>x</Button>
      <label>
        <input
          id="debug_styles"
          type="checkbox"
          onClick={event => localStorage.setItem('debug_styles', String(event.currentTarget.checked))}
          defaultChecked={debugStylesEnabled} />
        Debug styles
      </label>
      <label>
        <input
          id="lexical_debug_styles"
          type="checkbox"
          onClick={event => localStorage.setItem('lexical_debug_styles', String(event.currentTarget.checked))}
          defaultChecked={lexicalDebugStylesEnabled} />
        Lexical editor debug styles
      </label>
      <fieldset className="flex flex-col items-start mt-2">
        <legend>Debug namespaces</legend>
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
            {' ' + namespace}
          </label>,
        )}
      </fieldset>
    </div>
  </>
}
