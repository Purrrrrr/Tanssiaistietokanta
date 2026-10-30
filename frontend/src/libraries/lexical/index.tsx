import { lazy } from 'react'

import randomId from '@/utils/randomId'

import { type EditorProps } from './Editor'

export type { LinkNode, NodeRenderer, NodeRendererProps } from './DocumentViewer'
export { isEmptyDocument } from './utils/isEmptyDocument'
export type { MinifiedDocumentContent } from './utils/minify'

export const DocumentViewer = lazy(() => import('./DocumentViewer').then(m => ({ default: m.DocumentViewer })))
export const Editor = lazy(() => import('./Editor').then(m => ({ default: m.Editor })))

export type DocumentContentEditorProps = EditorProps

export function DocumentContentEditor(props: EditorProps) {
  if (props.readOnly) {
    return <DocumentViewer document={props.value} className={`${props.className ?? ''} overflow-auto border border-stone-200 p-4 bg-white`} />
  }
  return <Editor {...props} />
}

export const emptyDocument = () => ({
  V: 1, t: 'ro', c: [
    { _id: randomId(8), t: 'p', c: [] },
  ],
})
