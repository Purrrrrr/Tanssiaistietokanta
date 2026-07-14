import { useEffect, useState } from 'react'

import { type FabricDiagramData, FabricEditor } from 'libraries/fabric/FabricEditor'
import FabricImageViewer from 'libraries/fabric/FabricImageViewer'
import { H2 } from 'libraries/ui'

const defaultData: FabricDiagramData = { data: {}, width: 300, height: 300, hash: '' }

export function FabricShowcase({ twoEditors, showMinified, showViewer }: { twoEditors: boolean, showMinified: boolean, showViewer: boolean }) {
  const [state, setState] = useState<FabricDiagramData>(() => {
    const saved = window.localStorage.getItem('diagramShowcaseState')
    return saved ? JSON.parse(saved) : defaultData
  })
  useEffect(() => {
    window.localStorage.setItem('diagramShowcaseState', JSON.stringify(state))
  }, [state])
  return (
    <div className="flex flex-col gap-4">
      <FabricEditor {...state} onChange={setState} editable isSelected />
      {showViewer &&
        <div className="p-2 rounded border-gray-400 border-dashed border">
          <p className="mb-2 text-xs text-gray-500">Document Viewer (read-only, no Fabric runtime)</p>
          <FabricImageViewer node={state} />
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
          <FabricEditor {...state} onChange={setState} editable isSelected />
        </>
      }
    </div>
  )
}
