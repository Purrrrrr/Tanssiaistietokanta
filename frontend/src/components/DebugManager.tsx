import React, {useState} from 'react'

import {enableNamespaces, getKnownNamespaces} from 'utils/debug'

export default function DebugManager() {
  const [state, setState] = useState(() => Array.from(getKnownNamespaces().entries()))
  const [visible, setVisible] = useState(false)

  return <>
    <button className="bp4-button bp4-minimal bp4-small" onClick={() => setVisible(!visible)}>⚙</button>
    <fieldset style={{display: visible ? 'flex' : 'none', flexDirection: 'column', alignItems: 'start', position: 'fixed', bottom: 30, right: 30}}>
      <legend>Debug namespaces</legend>
      <button style={{position: 'absolute', top: 0, right: 5}} className="bp4-button bp4-minimal bp4-small" onClick={() => setVisible(false)}>x</button>
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
