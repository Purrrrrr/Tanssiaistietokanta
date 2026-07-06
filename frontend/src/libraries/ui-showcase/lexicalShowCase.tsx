import { useEffect, useState } from 'react'

import { DocumentViewer, Editor, type MinifiedDocumentContent } from 'libraries/lexical'
import { H2 } from 'libraries/ui'

export function EditorShowcase({ twoEditors, showMinified, showViewer }: { twoEditors: boolean, showMinified: boolean, showViewer: boolean }) {
  const [state, setState] = useState<MinifiedDocumentContent | null>(() => {
    const saved = window.localStorage.getItem('editorShowcaseState')
    return saved ? JSON.parse(saved) : null
  })
  useEffect(() => {
    window.localStorage.setItem('editorShowcaseState', JSON.stringify(state))
  }, [state])
  return (
    <div className="flex flex-col gap-4">
      <Editor value={state} imageUpload={{ owner: 'dances', owningId: 'fuu' }} onChange={setState} />
      {showViewer &&
        <div className="p-2 rounded border-gray-400 border-dashed border">
          <p className="mb-2 text-xs text-gray-500">Document Viewer (read-only, no Lexical runtime)</p>
          <DocumentViewer document={state} />
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
          <Editor value={state} imageUpload={{ owner: 'dances', owningId: 'fuu' }} onChange={setState} />
        </>
      }
    </div>
  )
}
