import { lazy } from 'react'

import { FieldComponentProps } from 'libraries/forms'
import randomId from 'utils/randomId'

import { type EditorProps } from './Editor'
import type { MinifiedDocumentContent } from './utils/minify'

export type { LinkNode, NodeRenderer, NodeRendererProps } from './DocumentViewer'
export { isEmptyDocument } from './utils/isEmptyDocument'
export type { MinifiedDocumentContent } from './utils/minify'

export const DocumentViewer = lazy(() => import('./DocumentViewer').then(m => ({ default: m.DocumentViewer })))
export const Editor = lazy(() => import('./Editor').then(m => ({ default: m.Editor })))

export interface DocumentContentEditorProps extends Omit<EditorProps, 'onChange'>, FieldComponentProps<MinifiedDocumentContent> {
  id: string
  value: MinifiedDocumentContent | null | undefined
}

export function DocumentContentEditor(props: DocumentContentEditorProps) {
  if (props.readOnly) {
    return <DocumentViewer document={props.value} className={props.className} />
  }
  return <Editor {...props} />
}

export const emptyDocument = () => ({
  V: 1, t: 'ro', c: [
    { _id: randomId(8), t: 'p', c: [] },
  ],
})
