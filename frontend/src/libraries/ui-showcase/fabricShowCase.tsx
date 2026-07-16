import { useEffect, useState } from 'react'

import { type FabricDiagramData, FabricEditor } from 'libraries/fabric/FabricEditor'
import FabricImageViewer from 'libraries/fabric/FabricImageViewer'
import { H2 } from 'libraries/ui'

const defaultData: FabricDiagramData = { data: {}, width: 300, height: 300, hash: '' }

export function FabricShowcase({ twoEditors, showMinified, showViewer, backgroundDiagram }: {
  twoEditors: boolean
  showMinified: boolean
  showViewer: boolean
  backgroundDiagram: boolean
}) {
  const [state, setState] = useLocalStorageState<FabricDiagramData>('diagramShowcaseState', defaultData)
  const [bgState, setBgState] = useLocalStorageState<FabricDiagramData>('diagramBgShowcaseState', defaultData)

  const bg = backgroundDiagram ? bgState : undefined
  return (
    <div className="flex flex-col gap-4">
      <FabricEditor value={state} onChange={setState} baseDiagram={bg} />
      {showViewer &&
        <div className="p-2 rounded border-gray-400 border-dashed border">
          <p className="mb-2 text-xs text-gray-500">Document Viewer (read-only, no Fabric runtime)</p>
          <FabricImageViewer diagram={state} backgroundDiagram={bg} />
        </div>
      }
      {showMinified &&
        <>
          <H2>Minified state ({JSON.stringify(state).length} bytes)</H2>
          <pre className="overflow-auto p-2 bg-gray-100 rounded max-h-200"><code>{JSON.stringify(state, null, 2)}</code></pre>
        </>
      }
      {twoEditors &&
        <>
          <H2>Another editor instance with the same state</H2>
          <FabricEditor value={state} onChange={setState} baseDiagram={bg} />
        </>
      }
      {backgroundDiagram &&
        <>
          <H2>Editor for the background diagram</H2>
          <FabricEditor value={bgState} onChange={setBgState} />
        </>
      }
    </div>
  )
}

function useLocalStorageState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const saved = window.localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  })
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])
  return [state, setState]
}
